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
     * ✅ MODIFIÉ - Met à jour le score d'un joueur (sans difficultyPoints)
     */
    async updatePlayerScore(userId, username, points, isComplete, gameStats = {}) {
        try {
            console.log('PlayerManager.updatePlayerScore called with:', {
                userId, username, points, isComplete,
                guildId: gameStats.guildId
            });

            // ✅ CORRIGÉ: Passer le guildId lors de la recherche/création du joueur
            let player = await this.findOrCreatePlayer(userId, username, gameStats.guildId);

            // Créer les données de session de jeu
            const gameSession = {
                userId: userId,
                guildId: gameStats.guildId || null,
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
                pointsEarned: points || 0
            };

            // ✅ Sauvegarder la session de jeu
            await this.playerRepository.saveGameSession(gameSession);

            // ✅ CORRIGÉ: Utiliser les noms de colonnes SQL (snake_case)
            const newStats = {
                // ❌ SUPPRIMÉ: userId, username, guildId ne sont PAS des colonnes à mettre à jour
                total_points: player.totalPoints + (points || 0),  // ✅ Total historique
                prestige_points: (player.prestigePoints || 0) + (points || 0),  // ✅ Points dans le prestige actuel
                games_played: player.gamesPlayed + 1,  // ✅ snake_case
                games_won: player.gamesWon + (isComplete ? 1 : 0),  // ✅ snake_case
                correct_brand_guesses: player.correctBrandGuesses + (gameStats.makeFound ? 1 : 0),  // ✅ snake_case
                correct_model_guesses: player.correctModelGuesses + (gameStats.modelFound ? 1 : 0),  // ✅ snake_case
                total_brand_guesses: player.totalBrandGuesses + (gameStats.attemptsMake || 0),  // ✅ snake_case
                total_model_guesses: player.totalModelGuesses + (gameStats.attemptsModel || 0)  // ✅ snake_case
            };

            // Gérer les streaks
            if (isComplete) {
                newStats.current_streak = player.currentStreak + 1;  // ✅ snake_case
                if (newStats.current_streak > player.bestStreak) {
                    newStats.best_streak = newStats.current_streak;  // ✅ snake_case
                }
            } else {
                newStats.current_streak = 0;  // ✅ snake_case
            }

            // Mettre à jour le temps de réponse si disponible
            if (gameSession.durationSeconds && isComplete) {
                // Mettre à jour le meilleur temps
                if (!player.bestTime || gameSession.durationSeconds < player.bestTime) {
                    newStats.best_time = gameSession.durationSeconds;  // ✅ snake_case
                }

                // Mettre à jour le temps de réponse moyen
                if (newStats.games_won > 1) {
                    newStats.average_response_time = ((player.averageResponseTime * (newStats.games_won - 1)) + gameSession.durationSeconds) / newStats.games_won;  // ✅ snake_case
                } else {
                    newStats.average_response_time = gameSession.durationSeconds;  // ✅ snake_case
                }
            }

            console.log('PlayerManager.updatePlayerScore - newStats to save:', newStats);

            // ✅ Sauvegarder les statistiques mises à jour avec le bon guildId
            const updatedPlayer = await this.playerRepository.updatePlayerStats(userId, newStats, gameStats.guildId);

            console.log('PlayerManager.updatePlayerScore - updatedPlayer:', {
                totalPoints: updatedPlayer.totalPoints,
                gamesPlayed: updatedPlayer.gamesPlayed,
                gamesWon: updatedPlayer.gamesWon
            });

            logger.info('Player score updated:', {
                userId, guildId: gameStats.guildId,
                points,
                isComplete,
                abandoned: gameStats.abandoned || false,
                timeout: gameStats.timeout || false,
                gamesPlayed: updatedPlayer.gamesPlayed,
                gamesWon: updatedPlayer.gamesWon,
                newTotal: updatedPlayer.totalPoints
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
 * Classement mensuel (parties créées ce mois)
 */
    async getMonthlyLeaderboard(limit = 10, guildId = null) {
        try {
            const leaderboard = await this.playerRepository.getMonthlyLeaderboard(limit, guildId);
            return leaderboard;
        } catch (error) {
            logger.error('Error getting monthly leaderboard:', { limit, guildId, error });
            return [];
        }
    }

    /**
     * Classement par vitesse (temps moyen le plus bas)
     */
    async getSpeedLeaderboard(limit = 10, guildId = null) {
        try {
            const leaderboard = await this.playerRepository.getSpeedLeaderboard(limit, guildId);
            return leaderboard;
        } catch (error) {
            logger.error('Error getting speed leaderboard:', { limit, guildId, error });
            return [];
        }
    }

    /**
     * Classement par précision (meilleur taux de réussite)
     */
    async getPrecisionLeaderboard(limit = 10, guildId = null) {
        try {
            const leaderboard = await this.playerRepository.getPrecisionLeaderboard(limit, guildId);
            return leaderboard;
        } catch (error) {
            logger.error('Error getting precision leaderboard:', { limit, guildId, error });
            return [];
        }
    }

    /**
     * Classement par séries (plus longues séries de victoires)
     */
    async getStreaksLeaderboard(limit = 10, guildId = null) {
        try {
            const leaderboard = await this.playerRepository.getStreaksLeaderboard(limit, guildId);
            return leaderboard;
        } catch (error) {
            logger.error('Error getting streaks leaderboard:', { limit, guildId, error });
            return [];
        }
    }

    /**
     * Classement par activité (plus de parties jouées)
     */
    async getActivityLeaderboard(limit = 10, guildId = null) {
        try {
            const leaderboard = await this.playerRepository.getActivityLeaderboard(limit, guildId);
            return leaderboard;
        } catch (error) {
            logger.error('Error getting activity leaderboard:', { limit, guildId, error });
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
                guildId: gameStats.guildId || null, // ✅ AJOUTER le guildId ici !
                carId: car.id,
                brandId: car.brandId,
                attemptsUsed: gameStats.attemptsMake + gameStats.attemptsModel,
                timeTaken: gameStats.duration
            });

            logger.info('Car found recorded:', {
                userId,
                guildId: gameStats.guildId, // ✅ Logger aussi le guildId
                car: car.getFullName(),
                attempts: gameStats.attemptsMake + gameStats.attemptsModel,
                time: gameStats.duration
            });
        } catch (error) {
            logger.error('Error recording car found:', {
                userId,
                guildId: gameStats.guildId, // ✅ Logger le guildId en cas d'erreur
                carId: car.id,
                error
            });
            // Ne pas faire échouer le jeu si l'enregistrement rate
        }
    }

    /**
     * Fait monter un joueur en prestige
     * Reset le prestige_points à 0 et augmente prestige_level
     */
    async prestigePlayer(userId, guildId = null) {
        try {
            const levelSystem = require('../levels/LevelSystem');
            const prestigeSystem = require('../prestige/PrestigeSystem');

            // Récupérer le joueur
            const player = await this.playerRepository.findByUserIdAndGuild(userId, guildId);

            if (!player) {
                throw new ValidationError('Joueur non trouvé');
            }

            // Vérifier le niveau actuel
            const currentLevel = await levelSystem.getPlayerLevelWithPrestige(
                player.prestigePoints || 0,
                player.prestigeLevel || 0
            );

            // Vérifier si peut prestigier
            const canPrestige = await prestigeSystem.canPrestige(
                player.prestigePoints || 0,
                player.prestigeLevel || 0,
                currentLevel.levelIndex + 1 // levelIndex est 0-based, les niveaux sont 1-based
            );

            if (!canPrestige.canPrestige) {
                throw new ValidationError(canPrestige.reason);
            }

            // Monter en prestige
            const newPrestigeLevel = (player.prestigeLevel || 0) + 1;

            const updatedStats = {
                prestige_level: newPrestigeLevel,
                prestige_points: 0 // Reset les points dans le prestige
                // total_points reste inchangé (historique)
            };

            const updatedPlayer = await this.playerRepository.updatePlayerStats(
                userId,
                updatedStats,
                guildId
            );

            logger.info('Player prestiged:', {
                userId,
                guildId,
                oldPrestige: player.prestigeLevel || 0,
                newPrestige: newPrestigeLevel,
                totalPoints: player.totalPoints
            });

            return {
                success: true,
                newPrestigeLevel,
                nextPrestigeInfo: canPrestige.nextPrestigeInfo,
                player: updatedPlayer
            };

        } catch (error) {
            logger.error('Error prestiging player:', { userId, guildId, error });
            throw error;
        }
    }
}

module.exports = PlayerManager;
