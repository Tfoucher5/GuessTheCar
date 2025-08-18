// src/shared/database/repositories/PlayerRepository.js (VERSION OPTIMISÉE)

const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player');
const logger = require('../../utils/logger');

class PlayerRepository {
    constructor(realTimeRankingManager = null) {
        this.rankingManager = realTimeRankingManager;
    }

    /**
     * Injection du RankingManager pour les mises à jour instantanées
     */
    setRankingManager(rankingManager) {
        this.rankingManager = rankingManager;
    }

    /**
     * Obtient TOUS les joueurs pour initialiser le classement - CORRIGÉ
     */
    async getAllPlayersForRanking() {
        const query = `
            SELECT 
                us.*
            FROM user_scores us
            WHERE us.games_played > 0
            ORDER BY us.total_points DESC, us.games_won DESC, us.best_time ASC
        `;

        const results = await executeQuery(query);
        return results.map(row => Player.fromDatabase(row));
    }

    /**
     * Met à jour les stats d'un joueur ET le classement en temps réel
     */
    async updatePlayerStats(userId, stats) {
        const query = `
            UPDATE user_scores SET
                username = ?,
                total_points = ?,
                total_difficulty_points = ?,
                games_played = ?,
                games_won = ?,
                correct_brand_guesses = ?,
                correct_model_guesses = ?,
                total_brand_guesses = ?,
                total_model_guesses = ?,
                best_streak = ?,
                current_streak = ?,
                best_time = ?,
                average_response_time = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `;

        const params = [
            stats.username,
            stats.total_points || stats.totalPoints || 0,
            stats.total_difficulty_points || stats.totalDifficultyPoints || 0,
            stats.games_played || stats.gamesPlayed || 0,
            stats.games_won || stats.gamesWon || 0,
            stats.correct_brand_guesses || stats.correctBrandGuesses || 0,
            stats.correct_model_guesses || stats.correctModelGuesses || 0,
            stats.total_brand_guesses || stats.totalBrandGuesses || 0,
            stats.total_model_guesses || stats.totalModelGuesses || 0,
            stats.best_streak || stats.bestStreak || 0,
            stats.current_streak || stats.currentStreak || 0,
            stats.best_time || stats.bestTime || null,
            stats.average_response_time || stats.averageResponseTime || 0,
            userId
        ];

        // 1. Sauvegarder en base PUIS mettre à jour le cache
        await executeQuery(query, params);

        // 2. Mettre à jour INSTANTANÉMENT le classement en mémoire
        if (this.rankingManager) {
            try {
                const rankingUpdate = await this.rankingManager.updatePlayerInstantly(userId, stats);

                // Logger les changements significatifs de position
                if (rankingUpdate.positionChange !== 0) {
                    const direction = rankingUpdate.positionChange > 0 ? '📈' : '📉';
                    logger.info(`${direction} Classement ${stats.username}: ${rankingUpdate.oldRanking} → ${rankingUpdate.newRanking}`);
                }
            } catch (error) {
                logger.error('❌ Erreur mise à jour classement temps réel:', error);
                // Continue quand même, le classement sera mis à jour au prochain rechargement
            }
        }

        // 3. Retourner le joueur mis à jour depuis le cache (plus rapide)
        if (this.rankingManager) {
            const playerWithRanking = this.rankingManager.getPlayerWithRanking(userId);
            if (playerWithRanking) {
                return playerWithRanking;
            }
        }

        // Fallback : récupérer depuis la base
        return await this.findByUserId(userId);
    }

    /**
     * Met à jour SEULEMENT le ranking en base (utilisé par le système de sauvegarde périodique)
     */
    async updatePlayerRanking(userId, ranking) {
        const query = `
            UPDATE user_scores 
            SET ranking = ?, ranking_updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
        `;

        await executeQuery(query, [ranking, userId]);
    }

    /**
     * Obtient un joueur avec son classement - CORRIGÉ
     */
    async getPlayerWithRanking(userId) {
        // 1. Essayer le cache en temps réel d'abord
        if (this.rankingManager) {
            const cachedPlayer = this.rankingManager.getPlayerWithRanking(userId);
            if (cachedPlayer) {
                return cachedPlayer;
            }
        }

        // 2. Fallback : calcul depuis la base - CORRIGÉ pour totalPoints
        const query = `
            SELECT 
                us.*,
                (
                    SELECT COUNT(*) + 1 
                    FROM user_scores us2 
                    WHERE (us2.total_points > us.total_points)
                    OR (us2.total_points = us.total_points AND us2.games_won > us.games_won)
                    OR (us2.total_points = us.total_points AND us2.games_won = us.games_won AND us2.best_time < us.best_time)
                ) as ranking,
                CASE 
                    WHEN us.total_points >= 1000 THEN 'Expert'
                    WHEN us.total_points >= 500 THEN 'Avancé'
                    WHEN us.total_points >= 200 THEN 'Intermédiaire'
                    ELSE 'Débutant'
                END as skill_level,
                CASE 
                    WHEN us.total_brand_guesses > 0 THEN ROUND((us.correct_brand_guesses / us.total_brand_guesses) * 100, 1)
                    ELSE 0 
                END as success_rate
            FROM user_scores us
            WHERE us.user_id = ?
        `;

        const results = await executeQuery(query, [userId]);

        if (results.length === 0) {
            return null;
        }

        const row = results[0];
        return {
            ...Player.fromDatabase(row),
            ranking: row.ranking,
            skillLevel: row.skill_level,
            successRate: parseFloat(row.success_rate) || 0
        };
    }

    /**
     * Obtient le leaderboard - CORRIGÉ pour totalPoints
     */
    async getLeaderboard(limit = 10) {
        // 1. Utiliser le cache en temps réel
        if (this.rankingManager) {
            return this.rankingManager.getLeaderboard(limit);
        }

        // 2. Fallback : requête base (plus lente) - CORRIGÉE
        const query = `
            SELECT 
                us.*,
                ROW_NUMBER() OVER (
                    ORDER BY us.total_points DESC, us.games_won DESC, us.best_time ASC
                ) as ranking
            FROM user_scores us
            WHERE us.games_played > 0
            ORDER BY us.total_points DESC, us.games_won DESC, us.best_time ASC
            LIMIT ?
        `;

        const results = await executeQuery(query, [limit]);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking
        }));
    }

    /**
     * Obtient le classement autour d'un joueur spécifique - CORRIGÉ
     */
    async getLeaderboardAroundPlayer(userId, range = 5) {
        if (this.rankingManager) {
            return this.rankingManager.getLeaderboardAroundPlayer(userId, range);
        }

        // Fallback complexe pour la base de données - CORRIGÉ
        const playerRankingQuery = `
            SELECT 
                (
                    SELECT COUNT(*) + 1 
                    FROM user_scores us2 
                    WHERE (us2.total_points > us.total_points)
                    OR (us2.total_points = us.total_points AND us2.games_won > us.games_won)
                    OR (us2.total_points = us.total_points AND us2.games_won = us.games_won AND us2.best_time < us.best_time)
                ) as player_ranking
            FROM user_scores us
            WHERE us.user_id = ?
        `;

        const rankingResult = await executeQuery(playerRankingQuery, [userId]);
        if (rankingResult.length === 0) return [];

        const playerRanking = rankingResult[0].player_ranking;
        const startRanking = Math.max(1, playerRanking - range);
        const endRanking = playerRanking + range;

        const query = `
            SELECT 
                ranked_players.*
            FROM (
                SELECT 
                    us.*,
                    ROW_NUMBER() OVER (
                        ORDER BY us.total_points DESC, us.games_won DESC, us.best_time ASC
                    ) as ranking
                FROM user_scores us
                WHERE us.games_played > 0
            ) ranked_players
            WHERE ranked_players.ranking BETWEEN ? AND ?
            ORDER BY ranked_players.ranking
        `;

        const results = await executeQuery(query, [startRanking, endRanking]);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking
        }));
    }

    /**
     * Autres méthodes inchangées...
     */
    async findByUserId(userId) {
        const query = 'SELECT * FROM user_scores WHERE user_id = ?';
        const results = await executeQuery(query, [userId]);

        if (results.length === 0) {
            return null;
        }

        return Player.fromDatabase(results[0]);
    }

    async create(userId, username) {
        const query = `
            INSERT INTO user_scores (
                user_id, username, total_points, total_difficulty_points, games_played, games_won,
                correct_brand_guesses, correct_model_guesses, total_brand_guesses, total_model_guesses,
                best_streak, current_streak, best_time, average_response_time, created_at, updated_at
            ) VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        await executeQuery(query, [userId, username]);
        return await this.findByUserId(userId);
    }

    async findOrCreate(userId, username) {
        let player = await this.findByUserId(userId);

        if (!player) {
            player = await this.create(userId, username);

            // Ajouter au cache temps réel
            if (this.rankingManager) {
                await this.rankingManager.updatePlayerInstantly(userId, player);
            }
        } else if (player.username !== username) {
            player.username = username;
            await this.updatePlayerStats(userId, player);
        }

        return player;
    }

    // Méthodes de maintenance du système
    async getSystemStats() {
        const totalPlayersQuery = 'SELECT COUNT(*) as total FROM user_scores WHERE games_played > 0';
        const result = await executeQuery(totalPlayersQuery);

        return {
            totalActivePlayers: result[0].total,
            rankingSystem: this.rankingManager ? this.rankingManager.getSystemStats() : null
        };
    }
}

module.exports = PlayerRepository;