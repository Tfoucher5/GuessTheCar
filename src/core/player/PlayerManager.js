// src/core/player/PlayerManager.js
const PlayerRepository = require('../../shared/database/repositories/PlayerRepository');
const { ValidationError } = require('../../shared/errors');
const logger = require('../../shared/utils/logger');

class PlayerManager {
    constructor() {
        this.playerRepository = new PlayerRepository();
    }

    /**
     * Trouve ou crée un joueur
     */
    async findOrCreatePlayer(userId, username) {
        try {
            if (!userId || !username) {
                throw new ValidationError('User ID et username requis');
            }

            const player = await this.playerRepository.findOrCreate(userId, username);
            logger.debug('Player found or created:', { userId, username });

            return player;
        } catch (error) {
            logger.error('Error finding or creating player:', { userId, username, error });
            throw error;
        }
    }

    /**
     * ✅ CORRIGÉ - Met à jour le score d'un joueur
     */
    async updatePlayerScore(userId, username, basePoints, difficultyPoints, isComplete, gameStats = {}) {
        try {
            // Récupérer ou créer le joueur
            let player = await this.findOrCreatePlayer(userId, username);

            // Créer les données de session de jeu
            const gameSession = {
                userId: userId,
                carId: gameStats.carId || null,
                startedAt: gameStats.startedAt || new Date(),
                endedAt: new Date(),
                durationSeconds: gameStats.duration || null,
                attemptsMake: gameStats.attemptsMake || 0,
                attemptsModel: gameStats.attemptsModel || 0,
                makeFound: gameStats.makeFound || false,
                modelFound: gameStats.modelFound || false,
                completed: isComplete,
                abandoned: gameStats.abandoned || false,
                timeout: gameStats.timeout || false,
                carChangesUsed: gameStats.carChangesUsed || 0,
                hintsUsed: gameStats.hintsUsed || {},
                pointsEarned: basePoints || 0,
                difficultyPointsEarned: difficultyPoints || 0
            };

            // ✅ Sauvegarder la session de jeu
            await this.playerRepository.saveGameSession(gameSession);

            // Calculer les nouvelles statistiques
            const newStats = {
                userId: player.userId,
                username: player.username,
                totalPoints: player.totalPoints + (basePoints || 0),
                totalDifficultyPoints: player.totalDifficultyPoints + (difficultyPoints || 0),
                gamesPlayed: player.gamesPlayed + 1,
                gamesWon: player.gamesWon + (isComplete ? 1 : 0),
                correctBrandGuesses: player.correctBrandGuesses + (gameStats.makeFound ? 1 : 0),
                correctModelGuesses: player.correctModelGuesses + (gameStats.modelFound ? 1 : 0),
                totalBrandGuesses: player.totalBrandGuesses + (gameStats.attemptsMake || 0),
                totalModelGuesses: player.totalModelGuesses + (gameStats.attemptsModel || 0),
                bestStreak: player.bestStreak,
                currentStreak: player.currentStreak,
                bestTime: player.bestTime,
                averageResponseTime: player.averageResponseTime
            };

            // Gérer les streaks
            if (isComplete) {
                newStats.currentStreak = player.currentStreak + 1;
                if (newStats.currentStreak > player.bestStreak) {
                    newStats.bestStreak = newStats.currentStreak;
                }
            } else {
                newStats.currentStreak = 0;
            }

            // Mettre à jour le temps de réponse si disponible
            if (gameSession.durationSeconds && isComplete) {
                // Mettre à jour le meilleur temps
                if (!player.bestTime || gameSession.durationSeconds < player.bestTime) {
                    newStats.bestTime = gameSession.durationSeconds;
                }

                // Mettre à jour le temps de réponse moyen
                if (newStats.gamesWon > 1) {
                    newStats.averageResponseTime = ((player.averageResponseTime * (newStats.gamesWon - 1)) + gameSession.durationSeconds) / newStats.gamesWon;
                } else {
                    newStats.averageResponseTime = gameSession.durationSeconds;
                }
            }

            // ✅ Sauvegarder les statistiques mises à jour
            const updatedPlayer = await this.playerRepository.updatePlayerStats(userId, newStats);

            logger.info('Player score updated:', {
                userId,
                basePoints,
                difficultyPoints,
                isComplete,
                abandoned: gameStats.abandoned || false,
                timeout: gameStats.timeout || false,
                gamesPlayed: updatedPlayer.gamesPlayed,
                gamesWon: updatedPlayer.gamesWon,
                newTotal: updatedPlayer.totalDifficultyPoints
            });

            return updatedPlayer;

        } catch (error) {
            logger.error('Error updating player score:', { userId, error });
            throw error;
        }
    }

    /**
     * Obtient les statistiques d'un joueur avec son classement
     */
    async getPlayerWithRanking(userId) {
        try {
            const playerStats = await this.playerRepository.getPlayerWithRanking(userId);

            if (!playerStats) {
                logger.warn('Player not found for ranking:', { userId });
                return null;
            }

            return playerStats;
        } catch (error) {
            logger.error('Error getting player with ranking:', { userId, error });
            throw error;
        }
    }

    /**
     * Obtient le classement général
     */
    async getLeaderboard(limit = 10) {
        try {
            const leaderboard = await this.playerRepository.getLeaderboard(limit);
            logger.debug('Leaderboard retrieved:', { count: leaderboard.length });
            return leaderboard;
        } catch (error) {
            logger.error('Error getting leaderboard:', { error });
            throw error;
        }
    }

    /**
     * Remet à zéro les statistiques d'un joueur
     */
    async resetPlayerStats(userId) {
        try {
            const player = await this.playerRepository.findByUserId(userId);

            if (!player) {
                throw new ValidationError('Joueur non trouvé');
            }

            const resetData = {
                userId: player.userId,
                username: player.username,
                totalPoints: 0,
                totalDifficultyPoints: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                correctBrandGuesses: 0,
                correctModelGuesses: 0,
                totalBrandGuesses: 0,
                totalModelGuesses: 0,
                bestStreak: 0,
                currentStreak: 0,
                bestTime: null,
                averageResponseTime: 0
            };

            const updatedPlayer = await this.playerRepository.updatePlayerStats(userId, resetData);

            logger.info('Player stats reset:', { userId });

            return updatedPlayer;
        } catch (error) {
            logger.error('Error resetting player stats:', { userId, error });
            throw error;
        }
    }

    /**
     * Obtient un joueur par ID
     */
    async getPlayerById(userId) {
        try {
            const player = await this.playerRepository.findByUserId(userId);
            return player;
        } catch (error) {
            logger.error('Error getting player by ID:', { userId, error });
            throw error;
        }
    }

    /**
     * Met à jour le nom d'utilisateur d'un joueur
     */
    async updatePlayerUsername(userId, newUsername) {
        try {
            const player = await this.playerRepository.findByUserId(userId);

            if (!player) {
                throw new ValidationError('Joueur non trouvé');
            }

            await this.playerRepository.updateUsername(userId, newUsername);

            logger.info('Player username updated:', { userId, newUsername });

            return await this.playerRepository.findByUserId(userId);
        } catch (error) {
            logger.error('Error updating player username:', { userId, newUsername, error });
            throw error;
        }
    }

    /**
     * Supprime un joueur (admin uniquement)
     */
    async deletePlayer(userId) {
        try {
            // Note: Cette méthode nécessiterait l'implémentation de delete dans PlayerRepository
            logger.warn('Delete player requested but not implemented:', { userId });
            throw new Error('Suppression de joueur non implémentée');
        } catch (error) {
            logger.error('Error deleting player:', { userId, error });
            throw error;
        }
    }
}

module.exports = PlayerManager;
