// src/core/ranking/RealTimeRankingManager.js

const logger = require('../../shared/utils/logger');

class RealTimeRankingManager {
    constructor(playerRepository) {
        this.playerRepository = playerRepository;

        // Cache en mémoire du classement
        this.rankingCache = new Map(); // userId -> { ranking, player }
        this.sortedPlayersList = []; // Array ordonné pour la performance

        // Dernière mise à jour
        this.lastUpdate = null;
        this.isInitialized = false;

        // Intervalle de sauvegarde en base (toutes les 30 secondes)
        this.saveInterval = null;
        this.pendingUpdates = new Set(); // IDs des joueurs à sauvegarder
    }

    /**
     * Initialise le classement depuis la base de données
     */
    async initialize() {
        try {
            logger.info('🚀 Initialisation du système de classement temps réel...');

            // Charger tous les joueurs depuis la base
            const allPlayers = await this.playerRepository.getAllPlayersForRanking();

            // Trier les joueurs selon les critères
            this.sortedPlayersList = allPlayers.sort(this.comparePlayersFast);

            // Créer le cache avec les rankings
            this.rankingCache.clear();
            this.sortedPlayersList.forEach((player, index) => {
                this.rankingCache.set(player.userId, {
                    ranking: index + 1,
                    player: player,
                    lastUpdate: Date.now()
                });
            });

            this.lastUpdate = Date.now();
            this.isInitialized = true;

            // Démarrer la sauvegarde périodique
            this.startPeriodicSave();

            logger.info(`✅ Classement initialisé avec ${this.sortedPlayersList.length} joueurs`);

        } catch (error) {
            logger.error('❌ Erreur lors de l\'initialisation du classement:', error);
            throw error;
        }
    }

    /**
     * Comparaison ultra-rapide des joueurs - CORRIGÉE pour totalPoints
     */
    comparePlayersFast(playerA, playerB) {
        // 1. POINTS TOTAUX d'abord (principal critère) - CORRIGÉ
        const pointsA = playerA.totalPoints || 0;
        const pointsB = playerB.totalPoints || 0;

        if (pointsA !== pointsB) {
            return pointsB - pointsA; // Décroissant
        }

        // 2. En cas d'égalité : parties gagnées
        const wonA = playerA.gamesWon || 0;
        const wonB = playerB.gamesWon || 0;

        if (wonA !== wonB) {
            return wonB - wonA; // Décroissant
        }

        // 3. En cas d'égalité : meilleur temps (si disponible)
        const timeA = playerA.bestTime || Number.MAX_SAFE_INTEGER;
        const timeB = playerB.bestTime || Number.MAX_SAFE_INTEGER;

        if (timeA !== timeB) {
            return timeA - timeB; // Croissant (plus rapide = mieux)
        }

        // 4. Tie-breaker final : taux de réussite
        const rateA = playerA.gamesPlayed > 0 ? (playerA.gamesWon / playerA.gamesPlayed) : 0;
        const rateB = playerB.gamesPlayed > 0 ? (playerB.gamesWon / playerB.gamesPlayed) : 0;

        return rateB - rateA; // Décroissant
    }

    /**
     * Met à jour INSTANTANÉMENT un joueur dans le classement
     */
    async updatePlayerInstantly(userId, newStats) {
        if (!this.isInitialized) {
            logger.warn('⚠️ Classement non initialisé, initialisation...');
            await this.initialize();
        }

        try {
            // Créer/mettre à jour l'objet joueur
            const updatedPlayer = {
                userId: userId,
                username: newStats.username,
                totalPoints: newStats.totalPoints || 0,
                gamesWon: newStats.gamesWon || 0,
                gamesPlayed: newStats.gamesPlayed || 0,
                bestTime: newStats.bestTime || null,
                ...newStats
            };

            // Récupérer l'ancien ranking s'il existe
            const oldEntry = this.rankingCache.get(userId);
            const oldRanking = oldEntry ? oldEntry.ranking : null;

            // Supprimer l'ancien joueur de la liste triée
            if (oldEntry) {
                const oldIndex = this.sortedPlayersList.findIndex(p => p.userId === userId);
                if (oldIndex !== -1) {
                    this.sortedPlayersList.splice(oldIndex, 1);
                }
            }

            // Insérer le joueur à la bonne position (insertion triée ultra-rapide)
            const insertPosition = this.findInsertPosition(updatedPlayer);
            this.sortedPlayersList.splice(insertPosition, 0, updatedPlayer);

            // Recalculer les rankings seulement pour les joueurs affectés
            this.recalculateRankingsFromPosition(insertPosition);

            const newRanking = insertPosition + 1;

            // Logger les changements significatifs
            if (oldRanking && oldRanking !== newRanking) {
                const direction = newRanking < oldRanking ? '📈' : '📉';
                const diff = Math.abs(newRanking - oldRanking);
                logger.info(`${direction} ${updatedPlayer.username}: ${oldRanking} → ${newRanking} (${diff} places)`);
            }

            // Marquer pour sauvegarde en base
            this.pendingUpdates.add(userId);
            this.lastUpdate = Date.now();

            return {
                oldRanking,
                newRanking,
                player: updatedPlayer,
                positionChange: oldRanking ? oldRanking - newRanking : 0
            };

        } catch (error) {
            logger.error('❌ Erreur mise à jour instantanée:', { userId, error });
            throw error;
        }
    }

    /**
    * Création optimisée d'un objet joueur - CORRIGÉE
    */
    createOptimizedPlayer(userId, stats) {
        return {
            userId,
            username: stats.username || 'Unknown',
            totalPoints: Number(stats.totalPoints || stats.total_points || 0),
            gamesWon: Number(stats.gamesWon || stats.games_won || 0),
            gamesPlayed: Number(stats.gamesPlayed || 0),
            bestTime: stats.bestTime || stats.best_time || null,
            currentStreak: Number(stats.currentStreak || stats.current_streak || 0),
            bestStreak: Number(stats.bestStreak || stats.best_streak || 0),
            averageResponseTime: Number(stats.averageResponseTime || stats.average_response_time || 0),
            correctBrandGuesses: Number(stats.correctBrandGuesses || stats.correct_brand_guesses || 0),
            totalBrandGuesses: Number(stats.totalBrandGuesses || stats.total_brand_guesses || 0),
            lastUpdate: Date.now()
        };
    }

    /**
     * Trouve la position d'insertion dans la liste triée (recherche binaire)
     */
    findInsertPosition(newPlayer) {
        let left = 0;
        let right = this.sortedPlayersList.length;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const comparison = this.comparePlayersFast(newPlayer, this.sortedPlayersList[mid]);

            if (comparison < 0) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return left;
    }

    /**
     * Recalcule les rankings à partir d'une position donnée
     */
    recalculateRankingsFromPosition(startPosition) {
        for (let i = startPosition; i < this.sortedPlayersList.length; i++) {
            const player = this.sortedPlayersList[i];
            const newRanking = i + 1;

            this.rankingCache.set(player.userId, {
                ranking: newRanking,
                player: player,
                lastUpdate: Date.now()
            });
        }
    }

    /**
     * Obtient INSTANTANÉMENT le classement d'un joueur
     */
    getPlayerRanking(userId) {
        const entry = this.rankingCache.get(userId);
        return entry ? entry.ranking : null;
    }

    /**
     * Obtient INSTANTANÉMENT les statistiques d'un joueur avec son ranking
     */
    getPlayerWithRanking(userId) {
        const entry = this.rankingCache.get(userId);
        if (!entry) return null;

        return {
            ...entry.player,
            ranking: entry.ranking
        };
    }

    /**
     * Obtient INSTANTANÉMENT le leaderboard
     */
    getLeaderboard(limit = 10, startPosition = 0) {
        const endPosition = Math.min(startPosition + limit, this.sortedPlayersList.length);
        const leaderboard = [];

        for (let i = startPosition; i < endPosition; i++) {
            const player = this.sortedPlayersList[i];
            leaderboard.push({
                ...player,
                ranking: i + 1
            });
        }

        return leaderboard;
    }

    /**
     * Obtient le top autour d'un joueur spécifique
     */
    getLeaderboardAroundPlayer(userId, range = 5) {
        const entry = this.rankingCache.get(userId);
        if (!entry) return [];

        const playerPosition = entry.ranking - 1; // Index 0-based
        const start = Math.max(0, playerPosition - range);
        const end = Math.min(this.sortedPlayersList.length, playerPosition + range + 1);

        return this.getLeaderboard(end - start, start);
    }

    /**
     * Sauvegarde périodique en base de données
     */
    startPeriodicSave() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }

        this.saveInterval = setInterval(async() => {
            await this.savePendingUpdates();
        }, 30000); // Toutes les 30 secondes
    }

    /**
     * Sauvegarde les mises à jour en attente
     */
    async savePendingUpdates() {
        if (this.pendingUpdates.size === 0) return;

        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();

        logger.info(`💾 Sauvegarde de ${updates.length} mises à jour de classement...`);

        for (const userId of updates) {
            try {
                const entry = this.rankingCache.get(userId);
                if (entry) {
                    // Sauvegarder en base avec le ranking mis à jour
                    await this.playerRepository.updatePlayerRanking(userId, entry.ranking);
                }
            } catch (error) {
                logger.error(`❌ Erreur sauvegarde ranking pour ${userId}:`, error);
                // Remettre en attente en cas d'erreur
                this.pendingUpdates.add(userId);
            }
        }
    }

    /**
     * Force la sauvegarde immédiate
     */
    async forceSave() {
        await this.savePendingUpdates();
    }

    /**
     * Statistiques du système de classement
     */
    getSystemStats() {
        return {
            totalPlayers: this.sortedPlayersList.length,
            cacheSize: this.rankingCache.size,
            pendingUpdates: this.pendingUpdates.size,
            lastUpdate: this.lastUpdate,
            isInitialized: this.isInitialized,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
        };
    }

    /**
     * Recharge complètement le classement depuis la base
     */
    async reload() {
        logger.info('🔄 Rechargement complet du classement...');
        this.isInitialized = false;
        await this.initialize();
    }

    /**
     * Arrêt propre du système
     */
    async shutdown() {
        logger.info('🛑 Arrêt du système de classement...');

        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }

        // Sauvegarder les dernières mises à jour
        await this.savePendingUpdates();

        this.rankingCache.clear();
        this.sortedPlayersList = [];
        this.isInitialized = false;

        logger.info('✅ Système de classement arrêté');
    }
}

module.exports = RealTimeRankingManager;
