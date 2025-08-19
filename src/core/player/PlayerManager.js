// src/core/player/PlayerManager.js
const PlayerRepository = require('../../shared/database/repositories/PlayerRepository');
const { ValidationError } = require('../../shared/errors');
const logger = require('../../shared/utils/logger');

class PlayerManager {
    constructor() {
        this.playerRepository = new PlayerRepository();
    }

    /**
 * Trouve ou crée un joueur POUR UN SERVEUR SPÉCIFIQUE
 */
    async findOrCreatePlayer(userId, username, guildId = null) {
        try {
            if (!userId || !username) {
                throw new ValidationError('User ID et username requis');
            }

            // MODIFIÉ: Rechercher par userId ET guildId
            const player = await this.playerRepository.findOrCreate(userId, username, guildId);
            logger.debug('Player found or created:', { userId, username, guildId });

            return player;
        } catch (error) {
            logger.error('Error finding or creating player:', { userId, username, guildId, error });
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
                guildId: gameStats.guildId || null, // AJOUTÉ
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
                guildId: gameStats.guildId,
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
            const updatedPlayer = await this.playerRepository.updatePlayerStats(userId, newStats, gameStats.guildId);

            logger.info('Player score updated:', {
                userId, guildId: gameStats.guildId,
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
 * Obtient le classement POUR UN SERVEUR SPÉCIFIQUE
 */
    async getLeaderboard(limit = 10, guildId = null) {
        try {
            const leaderboard = await this.playerRepository.getLeaderboard(limit, guildId);
            return leaderboard;
        } catch (error) {
            logger.error('Error getting leaderboard:', { limit, guildId, error });
            return [];
        }
    }

    /**
     * Obtient les stats d'un joueur POUR UN SERVEUR SPÉCIFIQUE
     */
    async getPlayerWithRanking(userId, guildId = null) {
        try {
            const playerStats = await this.playerRepository.getPlayerWithRanking(userId, guildId);
            return playerStats;
        } catch (error) {
            logger.error('Error getting player with ranking:', { userId, guildId, error });
            return null;
        }
    }

    /**
     * Collection par serveur
     */
    async getPlayerCollection(userId, guildId = null) {
        try {
            const collectionStats = await this.playerRepository.getPlayerCollection(userId, guildId);
            return collectionStats;
        } catch (error) {
            logger.error('Error getting player collection:', { userId, guildId, error });
            return null;
        }
    }

    async getCollectionLeaderboard(limit = 10, guildId = null) {
        try {
            const leaderboard = await this.playerRepository.getCollectionLeaderboard(limit, guildId);
            return leaderboard;
        } catch (error) {
            logger.error('Error getting collection leaderboard:', { limit, guildId, error });
            return [];
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

    /**
     * Enregistre qu'un joueur a trouvé une voiture spécifique
     */
    async recordCarFound(userId, car, gameStats) {
        try {
            // Enregistrer la voiture trouvée (ignore si déjà trouvée grâce à UNIQUE KEY)
            await this.playerRepository.recordCarFound({
                userId,
                carId: car.id,
                brandId: car.brandId,
                attemptsUsed: gameStats.attemptsMake + gameStats.attemptsModel,
                timeTaken: gameStats.duration
            });

            logger.info('Car found recorded:', {
                userId,
                car: car.getFullName(),
                attempts: gameStats.attemptsMake + gameStats.attemptsModel,
                time: gameStats.duration
            });
        } catch (error) {
            logger.error('Error recording car found:', { userId, carId: car.id, error });
            // Ne pas faire échouer le jeu si l'enregistrement rate
        }
    }
}

module.exports = PlayerManager;
