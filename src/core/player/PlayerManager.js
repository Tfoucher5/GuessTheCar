const PlayerRepository = require('../../shared/database/repositories/PlayerRepository');
const Player = require('./Player');
const logger = require('../../shared/utils/logger');
const { NotFoundError } = require('../../shared/errors');

class PlayerManager {
    constructor() {
        this.playerRepository = new PlayerRepository();
    }

    /**
     * Obtient ou crée un joueur
     */
    async getOrCreatePlayer(userId, username) {
        try {
            let player = await this.playerRepository.findByUserId(userId);

            if (!player) {
                player = new Player(userId, username);
                player = await this.playerRepository.createPlayer(player);
                logger.info('New player created:', { userId, username });
            } else if (player.username !== username) {
                // Mise à jour du nom d'utilisateur si changé
                player.username = username;
                player = await this.playerRepository.updatePlayer(player);
                logger.info('Player username updated:', { userId, oldName: player.username, newName: username });
            }

            return player;
        } catch (error) {
            logger.error('Error getting or creating player:', { userId, username, error });
            throw error;
        }
    }

    /**
     * Met à jour le score d'un joueur
     */
    async updatePlayerScore(userId, username, basePoints, difficultyPoints, isFullSuccess) {
        try {
            const player = await this.playerRepository.updatePlayerScore(
                userId,
                username,
                basePoints,
                difficultyPoints,
                isFullSuccess
            );

            logger.info('Player score updated:', {
                userId,
                username,
                basePoints,
                difficultyPoints,
                isFullSuccess,
                totalPoints: player.totalDifficultyPoints
            });

            return player;
        } catch (error) {
            logger.error('Error updating player score:', { userId, username, error });
            throw error;
        }
    }

    /**
     * Met à jour les statistiques de jeu d'un joueur
     */
    async updatePlayerGameStats(userId, attempts, gameTime) {
        try {
            const player = await this.playerRepository.updatePlayerGameStats(userId, attempts, gameTime);

            logger.info('Player game stats updated:', {
                userId,
                attempts,
                gameTime,
                totalAttempts: player.totalAttempts,
                bestTime: player.bestTime
            });

            return player;
        } catch (error) {
            logger.error('Error updating player game stats:', { userId, attempts, gameTime, error });
            throw error;
        }
    }

    /**
     * Obtient les statistiques d'un joueur
     */
    async getPlayerStats(userId) {
        try {
            const player = await this.playerRepository.findByUserId(userId);

            if (!player) {
                throw new NotFoundError(`Joueur avec l'ID ${userId} non trouvé`);
            }

            // Ajouter le rang du joueur
            const rank = await this.playerRepository.getPlayerRank(userId);
            const stats = player.toJSON();
            stats.rank = rank;

            return stats;
        } catch (error) {
            logger.error('Error getting player stats:', { userId, error });
            throw error;
        }
    }

    /**
     * Obtient le classement des joueurs
     */
    async getLeaderboard(limit = 10) {
        try {
            const players = await this.playerRepository.getLeaderboard(limit);

            return players.map((player, index) => ({
                position: index + 1,
                ...player.toJSON()
            }));
        } catch (error) {
            logger.error('Error getting leaderboard:', { limit, error });
            throw error;
        }
    }

    /**
     * Recherche des joueurs par nom
     */
    async searchPlayers(username, limit = 10) {
        try {
            const players = await this.playerRepository.searchPlayersByUsername(username, limit);
            return players.map(player => player.toJSON());
        } catch (error) {
            logger.error('Error searching players:', { username, error });
            throw error;
        }
    }

    /**
     * Obtient les statistiques globales
     */
    async getGlobalStats() {
        try {
            const stats = await this.playerRepository.getGlobalStats();
            return {
                totalPlayers: stats.totalPlayers || 0,
                activePlayers: stats.activePlayers || 0,
                totalCarsGuessed: stats.totalCarsGuessed || 0,
                totalPartialGuesses: stats.totalPartialGuesses || 0,
                totalPoints: Math.round((stats.totalPoints || 0) * 10) / 10,
                averagePoints: Math.round((stats.avgPoints || 0) * 10) / 10,
                bestGlobalTime: stats.bestGlobalTime ? `${(stats.bestGlobalTime / 1000).toFixed(1)}s` : 'N/A',
                highestScore: Math.round((stats.highestScore || 0) * 10) / 10
            };
        } catch (error) {
            logger.error('Error getting global stats:', error);
            throw error;
        }
    }

    /**
     * Obtient les joueurs actifs récemment
     */
    async getRecentlyActivePlayers(days = 7, limit = 20) {
        try {
            const players = await this.playerRepository.getRecentlyActivePlayers(days, limit);
            return players.map(player => player.toJSON());
        } catch (error) {
            logger.error('Error getting recently active players:', { days, limit, error });
            throw error;
        }
    }

    /**
     * Vérifie si un joueur existe
     */
    async playerExists(userId) {
        try {
            const player = await this.playerRepository.findByUserId(userId);
            return !!player;
        } catch (error) {
            logger.error('Error checking if player exists:', { userId, error });
            return false;
        }
    }

    /**
     * Migre les données depuis l'ancien système de scores
     */
    async migrateLegacyScores(legacyData) {
        try {
            let migratedCount = 0;
            let errorCount = 0;

            for (const [userId, userData] of Object.entries(legacyData)) {
                try {
                    const existingPlayer = await this.playerRepository.findByUserId(userId);

                    if (!existingPlayer) {
                        const player = Player.fromLegacyData(userId, userData);
                        await this.playerRepository.createPlayer(player);
                        migratedCount++;
                        logger.info('Legacy player migrated:', { userId, username: userData.username });
                    }
                } catch (error) {
                    errorCount++;
                    logger.error('Error migrating legacy player:', { userId, error });
                }
            }

            logger.info('Legacy migration completed:', { migratedCount, errorCount });
            return { migratedCount, errorCount };
        } catch (error) {
            logger.error('Error during legacy migration:', error);
            throw error;
        }
    }

    /**
     * Réinitialise les statistiques d'un joueur
     */
    async resetPlayerStats(userId) {
        try {
            const player = await this.playerRepository.findByUserId(userId);

            if (!player) {
                throw new NotFoundError(`Joueur avec l'ID ${userId} non trouvé`);
            }

            // Créer un nouveau joueur avec les mêmes identifiants mais stats à zéro
            const resetPlayer = new Player(player.userId, player.username);
            await this.playerRepository.updatePlayer(resetPlayer);

            logger.info('Player stats reset:', { userId, username: player.username });
            return resetPlayer;
        } catch (error) {
            logger.error('Error resetting player stats:', { userId, error });
            throw error;
        }
    }

    /**
     * Supprime un joueur
     */
    async deletePlayer(userId) {
        try {
            const player = await this.playerRepository.findByUserId(userId);

            if (!player) {
                throw new NotFoundError(`Joueur avec l'ID ${userId} non trouvé`);
            }

            await this.playerRepository.deleteWhere({ user_id: userId });

            logger.info('Player deleted:', { userId, username: player.username });
            return true;
        } catch (error) {
            logger.error('Error deleting player:', { userId, error });
            throw error;
        }
    }

    /**
     * Met à jour un joueur existant
     */
    async updatePlayer(player) {
        try {
            const updatedPlayer = await this.playerRepository.updatePlayer(player);
            logger.info('Player updated:', { userId: player.userId, username: player.username });
            return updatedPlayer;
        } catch (error) {
            logger.error('Error updating player:', { userId: player.userId, error });
            throw error;
        }
    }
}

module.exports = PlayerManager;