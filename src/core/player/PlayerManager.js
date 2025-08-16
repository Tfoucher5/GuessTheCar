const PlayerRepository = require('../../shared/database/repositories/PlayerRepository');
const Player = require('./Player');
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
     * Met à jour le score d'un joueur
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

            // Enregistrer la session de jeu
            if (gameSession.carId) {
                await this.playerRepository.saveGameSession(gameSession);
            }

            // Mettre à jour les statistiques du joueur
            player.updateGameStats(gameSession);

            // Sauvegarder les changements
            const updatedPlayer = await this.playerRepository.updatePlayerStats(userId, player.toDatabase());

            logger.info('Player score updated:', {
                userId,
                basePoints,
                difficultyPoints,
                isComplete,
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
                logger.debug('No player stats found for user:', { userId });
                return null;
            }

            return playerStats;
        } catch (error) {
            logger.error('Error getting player with ranking:', { userId, error });
            throw error;
        }
    }

    /**
     * Obtient le classement des joueurs
     */
    async getLeaderboard(limit = 10) {
        try {
            const leaderboard = await this.playerRepository.getLeaderboard(limit);

            logger.debug('Leaderboard retrieved:', { count: leaderboard.length, limit });

            return leaderboard;
        } catch (error) {
            logger.error('Error getting leaderboard:', { limit, error });
            throw error;
        }
    }

    /**
     * Obtient les statistiques globales
     */
    async getGlobalStats() {
        try {
            const stats = await this.playerRepository.getGlobalStats();
            return stats;
        } catch (error) {
            logger.error('Error getting global stats:', error);
            throw error;
        }
    }

    /**
     * Remet à zéro les statistiques d'un joueur (admin uniquement)
     */
    async resetPlayerStats(userId) {
        try {
            const player = await this.playerRepository.findByUserId(userId);

            if (!player) {
                throw new ValidationError('Joueur non trouvé');
            }

            // Réinitialiser toutes les statistiques
            const resetData = {
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
                bestTime: null
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

            player.username = newUsername;
            const updatedPlayer = await this.playerRepository.updatePlayerStats(userId, player.toDatabase());

            logger.info('Player username updated:', { userId, newUsername });

            return updatedPlayer;
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
