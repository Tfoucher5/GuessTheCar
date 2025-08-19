// src/shared/database/repositories/PlayerRepository.js
const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player');

class PlayerRepository extends BaseRepository {
    constructor() {
        super('user_scores');
    }

    /**
     * Crée un nouveau joueur avec les valeurs par défaut
     */
    async create(userId, username) {
        const query = `
            INSERT INTO user_scores (
                user_id, 
                username, 
                total_points, 
                total_difficulty_points, 
                games_played, 
                games_won, 
                correct_brand_guesses, 
                correct_model_guesses, 
                total_brand_guesses, 
                total_model_guesses, 
                best_streak, 
                current_streak, 
                best_time, 
                average_response_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userId,
            username,
            0,    // total_points
            0,    // total_difficulty_points
            0,    // games_played
            0,    // games_won
            0,    // correct_brand_guesses
            0,    // correct_model_guesses
            0,    // total_brand_guesses
            0,    // total_model_guesses
            0,    // best_streak
            0,    // current_streak
            null, // best_time
            0     // average_response_time
        ];

        await executeQuery(query, params);
        return await this.findByUserId(userId);
    }

    /**
     * Trouve un joueur par user_id
     */
    async findByUserId(userId) {
        const query = 'SELECT * FROM user_scores WHERE user_id = ?';
        const results = await executeQuery(query, [userId]);

        if (results.length === 0) {
            return null;
        }

        return Player.fromDatabase(results[0]);
    }

    /**
     * Trouve ou crée un joueur
     */
    async findOrCreate(userId, username) {
        let player = await this.findByUserId(userId);

        if (!player) {
            player = await this.create(userId, username);
        } else if (player.username !== username) {
            // Mettre à jour le nom d'utilisateur si changé
            await this.updateUsername(userId, username);
            player.username = username;
        }

        return player;
    }

    /**
     * Met à jour le nom d'utilisateur
     */
    async updateUsername(userId, username) {
        const query = 'UPDATE user_scores SET username = ? WHERE user_id = ?';
        await executeQuery(query, [username, userId]);
    }

    /**
     * Met à jour les statistiques d'un joueur
     */
    async updatePlayerStats(userId, playerData) {
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
            playerData.username,
            playerData.totalPoints || 0,
            playerData.totalDifficultyPoints || 0,
            playerData.gamesPlayed || 0,
            playerData.gamesWon || 0,
            playerData.correctBrandGuesses || 0,
            playerData.correctModelGuesses || 0,
            playerData.totalBrandGuesses || 0,
            playerData.totalModelGuesses || 0,
            playerData.bestStreak || 0,
            playerData.currentStreak || 0,
            playerData.bestTime || null,
            playerData.averageResponseTime || 0,
            userId
        ];

        await executeQuery(query, params);
        return await this.findByUserId(userId);
    }

    /**
     * ✅ NOUVELLE MÉTHODE - Enregistre une session de jeu
     */
    async saveGameSession(sessionData) {
        const query = `
            INSERT INTO game_sessions (
                user_id, car_id, started_at, ended_at, duration_seconds,
                attempts_make, attempts_model, make_found, model_found,
                completed, abandoned, timeout, car_changes_used, hints_used,
                points_earned, difficulty_points_earned
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Gestion correcte de hintsUsed
        let hintsUsedJson = '{}';
        if (sessionData.hintsUsed) {
            if (typeof sessionData.hintsUsed === 'object') {
                hintsUsedJson = JSON.stringify(sessionData.hintsUsed);
            } else if (typeof sessionData.hintsUsed === 'string') {
                hintsUsedJson = sessionData.hintsUsed;
            }
        }

        const params = [
            sessionData.userId,
            sessionData.carId || null,
            sessionData.startedAt || new Date(),
            sessionData.endedAt || new Date(),
            sessionData.durationSeconds || null,
            sessionData.attemptsMake || 0,
            sessionData.attemptsModel || 0,
            sessionData.makeFound ? 1 : 0,
            sessionData.modelFound ? 1 : 0,
            sessionData.completed ? 1 : 0,
            sessionData.abandoned ? 1 : 0,
            sessionData.timeout ? 1 : 0,
            sessionData.carChangesUsed || 0,
            hintsUsedJson,
            sessionData.pointsEarned || 0,
            sessionData.difficultyPointsEarned || 0
        ];

        console.log('DEBUG saveGameSession params:', params);
        await executeQuery(query, params);
    }

    /**
     * Met à jour le score après une partie
     */
    async updatePlayerAfterGame(userId, gameResult) {
        const player = await this.findByUserId(userId);
        if (!player) return null;

        // Calcul des nouvelles statistiques
        const newStats = {
            ...player,
            totalPoints: player.totalPoints + (gameResult.basePoints || 0),
            totalDifficultyPoints: player.totalDifficultyPoints + (gameResult.difficultyPoints || 0),
            gamesPlayed: player.gamesPlayed + 1,
            gamesWon: player.gamesWon + (gameResult.completed ? 1 : 0),
            correctBrandGuesses: player.correctBrandGuesses + (gameResult.makeFound ? 1 : 0),
            correctModelGuesses: player.correctModelGuesses + (gameResult.modelFound ? 1 : 0),
            totalBrandGuesses: player.totalBrandGuesses + (gameResult.attemptsMake || 0),
            totalModelGuesses: player.totalModelGuesses + (gameResult.attemptsModel || 0)
        };

        // Mettre à jour les streaks
        if (gameResult.completed) {
            newStats.currentStreak = player.currentStreak + 1;
            if (newStats.currentStreak > player.bestStreak) {
                newStats.bestStreak = newStats.currentStreak;
            }
        } else {
            newStats.currentStreak = 0;
        }

        return await this.updatePlayerStats(userId, newStats);
    }

    /**
     * Obtient le classement des joueurs
     */
    async getLeaderboard(limit = 10) {
        const query = `
            SELECT 
                us.*,
                ROW_NUMBER() OVER (ORDER BY us.total_difficulty_points DESC, us.games_won DESC) as ranking
            FROM user_scores us
            WHERE us.games_played > 0
            ORDER BY us.total_difficulty_points DESC, us.games_won DESC
            LIMIT ?
        `;

        const results = await executeQuery(query, [limit]);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking
        }));
    }

    /**
     * Obtient les statistiques d'un joueur avec son classement
     */
    async getPlayerWithRanking(userId) {
        const query = `
            SELECT 
                us.*,
                (
                    SELECT COUNT(*) + 1 
                    FROM user_scores us2 
                    WHERE us2.total_difficulty_points > us.total_difficulty_points
                    OR (us2.total_difficulty_points = us.total_difficulty_points AND us2.games_won > us.games_won)
                ) as ranking,
                CASE 
                    WHEN us.total_difficulty_points >= 100 THEN 'Expert'
                    WHEN us.total_difficulty_points >= 50 THEN 'Avancé'
                    WHEN us.total_difficulty_points >= 20 THEN 'Intermédiaire'
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
     * Enregistre qu'un joueur a trouvé une voiture
     */
    async recordCarFound(data) {
        const query = `
        INSERT IGNORE INTO user_cars_found 
        (user_id, car_id, brand_id, attempts_used, time_taken)
        VALUES (?, ?, ?, ?, ?)
    `;

        return await this.db.execute(query, [
            data.userId,
            data.carId,
            data.brandId,
            data.attemptsUsed,
            data.timeTaken
        ]);
    }

    /**
     * Obtient les statistiques de collection d'un joueur
     */
    async getPlayerCollection(userId) {
        const query = `
        SELECT 
            COUNT(DISTINCT ucf.car_id) as carsFound,
            COUNT(DISTINCT ucf.brand_id) as brandsFound,
            (SELECT COUNT(*) FROM models) as totalCars,
            (SELECT COUNT(*) FROM brands) as totalBrands,
            AVG(ucf.attempts_used) as avgAttempts,
            AVG(ucf.time_taken) as avgTime,
            MIN(ucf.found_at) as firstCarDate,
            MAX(ucf.found_at) as lastCarDate
        FROM user_cars_found ucf
        WHERE ucf.user_id = ?
    `;

        const [results] = await this.db.execute(query, [userId]);
        return results[0];
    }

    /**
     * Obtient le classement des collectionneurs
     */
    async getCollectionLeaderboard(limit) {
        const query = `
        SELECT 
            us.username,
            us.user_id,
            COUNT(DISTINCT ucf.car_id) as carsFound,
            COUNT(DISTINCT ucf.brand_id) as brandsFound,
            (SELECT COUNT(*) FROM models) as totalCars,
            (SELECT COUNT(*) FROM brands) as totalBrands,
            ROUND((COUNT(DISTINCT ucf.car_id) / (SELECT COUNT(*) FROM models)) * 100, 1) as completionPercentage
        FROM user_scores us
        LEFT JOIN user_cars_found ucf ON us.user_id = ucf.user_id
        WHERE COUNT(DISTINCT ucf.car_id) > 0
        GROUP BY us.user_id, us.username
        ORDER BY carsFound DESC, brandsFound DESC
        LIMIT ?
    `;

        const [results] = await this.db.execute(query, [limit]);
        return results;
    }
}

module.exports = PlayerRepository;
