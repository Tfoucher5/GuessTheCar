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

            // IMPORTANT: Toujours enregistrer la session si on a un carId (partie commencée)
            if (gameSession.carId) {
                await this.playerRepository.saveGameSession(gameSession);
            }

            // FAIRE LA MISE À JOUR DES STATS DIRECTEMENT ICI au lieu d'appeler player.updateGameStats()

            // Ajouter les points
            player.totalPoints += gameSession.pointsEarned || 0;
            player.totalDifficultyPoints += gameSession.difficultyPointsEarned || 0;

            // Incrémenter les parties jouées
            player.gamesPlayed += 1;

            // Compter les victoires
            if (gameSession.completed && !gameSession.abandoned) {
                player.gamesWon += 1;
                player.currentStreak += 1;

                // Mettre à jour le meilleur streak
                if (player.currentStreak > player.bestStreak) {
                    player.bestStreak = player.currentStreak;
                }
            } else {
                // Réinitialiser le streak en cas d'échec
                player.currentStreak = 0;
            }

            // Compter les tentatives et réussites de marques
            if (gameSession.attemptsMake > 0) {
                player.totalBrandGuesses += gameSession.attemptsMake;
                if (gameSession.makeFound) {
                    player.correctBrandGuesses += 1;
                }
            }

            // Compter les tentatives et réussites de modèles
            if (gameSession.attemptsModel > 0) {
                player.totalModelGuesses += gameSession.attemptsModel;
                if (gameSession.modelFound) {
                    player.correctModelGuesses += 1;
                }
            }

            // Mettre à jour le temps de réponse si disponible
            if (gameSession.durationSeconds && gameSession.completed) {
                // Mettre à jour le meilleur temps
                if (!player.bestTime || gameSession.durationSeconds < player.bestTime) {
                    player.bestTime = gameSession.durationSeconds;
                }

                // Mettre à jour le temps de réponse moyen
                if (player.gamesWon > 1) {
                    player.averageResponseTime = ((player.averageResponseTime * (player.gamesWon - 1)) + gameSession.durationSeconds) / player.gamesWon;
                } else {
                    player.averageResponseTime = gameSession.durationSeconds;
                }
            }

            // Mettre à jour le timestamp
            player.updatedAt = new Date();

            // Sauvegarder les changements - IL FAUT ENCORE VÉRIFIER QUE toDatabase() EXISTE
            const updatedPlayer = await this.playerRepository.updatePlayerStats(userId, player.toDatabase());

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
