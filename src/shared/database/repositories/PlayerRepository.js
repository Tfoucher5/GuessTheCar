// src/shared/database/repositories/PlayerRepository.js
const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player');

class PlayerRepository extends BaseRepository {
    constructor() {
        super('user_scores');
    }

    /**
     * ✅ CORRIGÉ - Crée un nouveau joueur avec les valeurs par défaut
     * IMPORTANT: Cette méthode surcharge celle du BaseRepository
     */
    async create(userId, username, guildId = null) {
        const query = `
            INSERT INTO user_scores (
                user_id,
                username,
                guild_id,
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userId,
            username,
            guildId,  // Peut être null pour les serveurs sans guildId
            0,        // total_points
            0,        // total_difficulty_points
            0,        // games_played
            0,        // games_won
            0,        // correct_brand_guesses
            0,        // correct_model_guesses
            0,        // total_brand_guesses
            0,        // total_model_guesses
            0,        // best_streak
            0,        // current_streak
            null,     // best_time
            null      // average_response_time
        ];

        console.log('PlayerRepository.create - Creating new player:', {
            userId, username, guildId
        });

        await executeQuery(query, params);
        return await this.findByUserIdAndGuild(userId, guildId);
    }

    /**
     * Trouve un joueur par userId ET guildId
     */
    async findByUserIdAndGuild(userId, guildId = null) {
        let query = 'SELECT * FROM user_scores WHERE user_id = ?';
        let params = [userId];

        if (guildId) {
            query += ' AND guild_id = ?';
            params.push(guildId);
        } else {
            query += ' AND guild_id IS NULL';
        }

        const results = await executeQuery(query, params);
        return results.length > 0 ? Player.fromDatabase(results[0]) : null;
    }

    /**
     * Trouve un joueur par userId (sans contrainte de serveur) - FALLBACK
     */
    async findByUserId(userId) {
        const query = 'SELECT * FROM user_scores WHERE user_id = ? LIMIT 1';
        const results = await executeQuery(query, [userId]);
        return results.length > 0 ? Player.fromDatabase(results[0]) : null;
    }

    /**
     * ✅ CORRIGÉ - Trouve ou crée un joueur pour un serveur spécifique
     */
    async findOrCreate(userId, username, guildId = null) {
        console.log('PlayerRepository.findOrCreate - Searching for player:', {
            userId, username, guildId
        });

        // Rechercher par userId ET guildId
        const player = await this.findByUserIdAndGuild(userId, guildId);

        if (player) {
            console.log('PlayerRepository.findOrCreate - Player found:', player);
            // Mettre à jour le username si nécessaire
            if (player.username !== username) {
                console.log('PlayerRepository.findOrCreate - Updating username');
                await this.updatePlayerStats(userId, { username }, guildId);
                player.username = username;
            }
            return player;
        }

        console.log('PlayerRepository.findOrCreate - Player not found, creating new one');
        // ✅ CORRIGÉ - Appeler la méthode create personnalisée
        return await this.create(userId, username, guildId);
    }

    /**
     * Met à jour le nom d'utilisateur
     */
    async updateUsername(userId, username) {
        const query = 'UPDATE user_scores SET username = ? WHERE user_id = ?';
        await executeQuery(query, [username, userId]);
    }

    /**
     * Met à jour les stats d'un joueur pour un serveur spécifique
     */
    async updatePlayerStats(userId, data, guildId = null) {
        const cleanData = this.cleanData(data, [
            'username', 'total_points', 'total_difficulty_points', 'games_played',
            'games_won', 'correct_brand_guesses', 'correct_model_guesses',
            'total_brand_guesses', 'total_model_guesses', 'best_streak',
            'current_streak', 'best_time', 'average_response_time'
        ]);

        if (Object.keys(cleanData).length === 0) {
            throw new Error('No valid data provided for update');
        }

        const setClause = Object.keys(cleanData).map(key => `${key} = ?`).join(', ');
        let whereClause = 'user_id = ?';
        let values = [...Object.values(cleanData), userId];

        if (guildId) {
            whereClause += ' AND guild_id = ?';
            values.push(guildId);
        } else {
            whereClause += ' AND guild_id IS NULL';
        }

        const query = `UPDATE user_scores SET ${setClause} WHERE ${whereClause}`;
        await executeQuery(query, values);

        return await this.findByUserIdAndGuild(userId, guildId);
    }

    /**
     * ✅ MÉTHODE pour nettoyer les données (éviter les undefined)
     */
    cleanData(data, allowedFields) {
        const cleaned = {};
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                cleaned[field] = data[field];
            }
        });
        return cleaned;
    }

    /**
     * Sauvegarde une session de jeu
     */
    async saveGameSession(gameSession) {
        const query = `
            INSERT INTO game_sessions (
                user_id, guild_id, car_id, started_at, ended_at, duration_seconds,
                attempts_make, attempts_model, make_found, model_found,
                completed, abandoned, timeout, car_changes_used, hints_used,
                points_earned, difficulty_points_earned
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            gameSession.userId,
            gameSession.guildId,
            gameSession.carId,
            gameSession.startedAt,
            gameSession.endedAt,
            gameSession.durationSeconds,
            gameSession.attemptsMake || 0,
            gameSession.attemptsModel || 0,
            gameSession.makeFound ? 1 : 0,
            gameSession.modelFound ? 1 : 0,
            gameSession.completed ? 1 : 0,
            gameSession.abandoned ? 1 : 0,
            gameSession.timeout ? 1 : 0,
            gameSession.carChangesUsed || 0,
            JSON.stringify(gameSession.hintsUsed || {}),
            gameSession.pointsEarned || 0,
            gameSession.difficultyPointsEarned || 0
        ];

        await executeQuery(query, params);
    }

    /**
     * Met à jour le score après une partie - AVEC support du guildId
     */
    async updatePlayerAfterGame(userId, gameResult, guildId = null) {
        const player = await this.findByUserIdAndGuild(userId, guildId);
        if (!player) return null;

        // Calcul des nouvelles statistiques
        const newStats = {
            total_points: player.totalPoints + (gameResult.basePoints || 0),
            total_difficulty_points: player.totalDifficultyPoints + (gameResult.difficultyPoints || 0),
            games_played: player.gamesPlayed + 1,
            games_won: player.gamesWon + (gameResult.completed ? 1 : 0),
            correct_brand_guesses: player.correctBrandGuesses + (gameResult.makeFound ? 1 : 0),
            correct_model_guesses: player.correctModelGuesses + (gameResult.modelFound ? 1 : 0),
            total_brand_guesses: player.totalBrandGuesses + (gameResult.attemptsMake || 0),
            total_model_guesses: player.totalModelGuesses + (gameResult.attemptsModel || 0)
        };

        // Mettre à jour les streaks
        if (gameResult.completed) {
            newStats.current_streak = player.currentStreak + 1;
            if (newStats.current_streak > player.bestStreak) {
                newStats.best_streak = newStats.current_streak;
            }
        } else {
            newStats.current_streak = 0;
        }

        return await this.updatePlayerStats(userId, newStats, guildId);
    }

    /**
     * Classement par serveur
     */
    async getLeaderboard(limit = 10, guildId = null) {
        let query = `
            SELECT 
                us.*,
                ROW_NUMBER() OVER (ORDER BY us.total_points DESC, us.games_won DESC) as ranking
            FROM user_scores us
            WHERE us.games_played > 0
        `;

        let params = [];

        if (guildId) {
            query += ' AND us.guild_id = ?';
            params.push(guildId);
        } else {
            query += ' AND us.guild_id IS NULL';
        }

        query += ' ORDER BY us.total_points DESC, us.games_won DESC LIMIT ?';
        params.push(limit);

        const results = await executeQuery(query, params);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking
        }));
    }

    /**
     * Stats avec ranking par serveur
     */
    async getPlayerWithRanking(userId, guildId = null) {
        let rankingCondition = guildId ?
            'WHERE us2.guild_id = ? AND (us2.total_points > us.total_points OR (us2.total_points = us.total_points AND us2.games_won > us.games_won))' :
            'WHERE us2.guild_id IS NULL AND (us2.total_points > us.total_points OR (us2.total_points = us.total_points AND us2.games_won > us.games_won))';

        let whereClause = guildId ?
            'WHERE us.user_id = ? AND us.guild_id = ?' :
            'WHERE us.user_id = ? AND us.guild_id IS NULL';

        const query = `
            SELECT 
                us.*,
                (SELECT COUNT(*) + 1 FROM user_scores us2 ${rankingCondition}) as ranking
            FROM user_scores us
            ${whereClause}
        `;

        const params = guildId ? [guildId, userId, guildId] : [userId];
        const results = await executeQuery(query, params);

        if (results.length === 0) {
            return null;
        }

        const row = results[0];
        return {
            ...Player.fromDatabase(row),
            ranking: row.ranking
        };
    }

    /**
     * Enregistre qu'un joueur a trouvé une voiture - AVEC support du guildId
     */
    async recordCarFound(data) {
        const query = `
            INSERT IGNORE INTO user_cars_found (
                user_id, guild_id, car_id, brand_id, attempts_used, time_taken
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            data.userId,
            data.guildId || null,
            data.carId,
            data.brandId,
            data.attemptsUsed,
            data.timeTaken
        ];

        await executeQuery(query, params);
    }

    /**
     * Obtient les statistiques de collection d'un joueur
     */
    async getPlayerCollection(userId, guildId = null) {
        let query = `
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

        let params = [userId];

        if (guildId) {
            query += ' AND ucf.guild_id = ?';
            params.push(guildId);
        } else {
            query += ' AND ucf.guild_id IS NULL';
        }

        const results = await executeQuery(query, params);
        return results[0];
    }

    /**
     * Obtient le classement des collectionneurs par serveur
     */
    async getCollectionLeaderboard(limit, guildId = null) {
        let query = `
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
        `;

        let params = [];

        if (guildId) {
            query += ' AND us.guild_id = ? AND (ucf.guild_id = ? OR ucf.guild_id IS NULL)';
            params.push(guildId, guildId);
        } else {
            query += ' AND us.guild_id IS NULL AND (ucf.guild_id IS NULL OR ucf.guild_id IS NULL)';
        }

        query += `
            GROUP BY us.user_id, us.username
            HAVING COUNT(DISTINCT ucf.car_id) > 0
            ORDER BY carsFound DESC, brandsFound DESC
            LIMIT ?
        `;

        params.push(limit);

        const results = await executeQuery(query, params);
        return results;
    }

    /**
 * Classement mensuel - joueurs avec le plus de points ce mois-ci
 */
    async getMonthlyLeaderboard(limit = 10, guildId = null) {
        let query = `
        SELECT 
            us.*,
            ROW_NUMBER() OVER (ORDER BY monthly_points DESC, monthly_wins DESC) as ranking,
            monthly_points,
            monthly_wins,
            monthly_games
        FROM (
            SELECT 
                us.user_id,
                us.username,
                us.guild_id,
                us.total_points,
                us.total_difficulty_points,
                us.games_played,
                us.games_won,
                us.correct_brand_guesses,
                us.correct_model_guesses,
                us.total_brand_guesses,
                us.total_model_guesses,
                us.best_streak,
                us.current_streak,
                us.best_time,
                us.average_response_time,
                us.created_at,
                us.updated_at,
                COALESCE(SUM(gs.points_earned + gs.difficulty_points_earned), 0) as monthly_points,
                COALESCE(COUNT(CASE WHEN gs.completed = 1 THEN 1 END), 0) as monthly_wins,
                COALESCE(COUNT(gs.id), 0) as monthly_games
            FROM user_scores us
            LEFT JOIN game_sessions gs ON us.user_id = gs.user_id 
                AND gs.started_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                AND gs.started_at < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')
            WHERE us.games_played > 0
    `;

        let params = [];

        if (guildId) {
            query += ' AND us.guild_id = ? AND (gs.guild_id = ? OR gs.guild_id IS NULL)';
            params.push(guildId, guildId);
        } else {
            query += ' AND us.guild_id IS NULL AND (gs.guild_id IS NULL OR gs.guild_id IS NULL)';
        }

        query += `
            GROUP BY us.user_id, us.username, us.guild_id, us.total_points, us.total_difficulty_points,
                     us.games_played, us.games_won, us.correct_brand_guesses, us.correct_model_guesses,
                     us.total_brand_guesses, us.total_model_guesses, us.best_streak, us.current_streak,
                     us.best_time, us.average_response_time, us.created_at, us.updated_at
            HAVING monthly_games > 0
        ) us
        ORDER BY monthly_points DESC, monthly_wins DESC 
        LIMIT ?
    `;

        params.push(limit);

        const results = await executeQuery(query, params);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking,
            monthlyPoints: row.monthly_points,
            monthlyWins: row.monthly_wins,
            monthlyGames: row.monthly_games
        }));
    }

    /**
     * Classement par vitesse - temps moyen le plus bas (uniquement joueurs avec parties complètes)
     */
    async getSpeedLeaderboard(limit = 10, guildId = null) {
        let query = `
        SELECT 
            us.*,
            ROW_NUMBER() OVER (ORDER BY avg_completion_time ASC, us.games_won DESC) as ranking,
            avg_completion_time,
            completed_games
        FROM (
            SELECT 
                us.*,
                AVG(gs.duration_seconds) as avg_completion_time,
                COUNT(gs.id) as completed_games
            FROM user_scores us
            INNER JOIN game_sessions gs ON us.user_id = gs.user_id 
                AND gs.completed = 1 
                AND gs.duration_seconds IS NOT NULL 
                AND gs.duration_seconds > 0
            WHERE us.games_won > 0
    `;

        let params = [];

        if (guildId) {
            query += ' AND us.guild_id = ? AND gs.guild_id = ?';
            params.push(guildId, guildId);
        } else {
            query += ' AND us.guild_id IS NULL AND gs.guild_id IS NULL';
        }

        query += `
            GROUP BY us.user_id
            HAVING completed_games >= 3
        ) us
        ORDER BY avg_completion_time ASC, games_won DESC 
        LIMIT ?
    `;

        params.push(limit);

        const results = await executeQuery(query, params);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking,
            averageTime: row.avg_completion_time,
            completedGames: row.completed_games
        }));
    }

    /**
     * Classement par précision - meilleur taux de réussite (minimum 5 parties)
     */
    async getPrecisionLeaderboard(limit = 10, guildId = null) {
        let query = `
        SELECT 
            us.*,
            ROW_NUMBER() OVER (ORDER BY success_rate DESC, us.games_played DESC) as ranking,
            ROUND((us.games_won / us.games_played) * 100, 1) as success_rate
        FROM user_scores us
        WHERE us.games_played >= 5
    `;

        let params = [];

        if (guildId) {
            query += ' AND us.guild_id = ?';
            params.push(guildId);
        } else {
            query += ' AND us.guild_id IS NULL';
        }

        query += `
        ORDER BY success_rate DESC, us.games_played DESC 
        LIMIT ?
    `;

        params.push(limit);

        const results = await executeQuery(query, params);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking,
            successRate: row.success_rate
        }));
    }

    /**
     * Classement par séries - plus longues séries de victoires
     */
    async getStreaksLeaderboard(limit = 10, guildId = null) {
        let query = `
        SELECT 
            us.*,
            ROW_NUMBER() OVER (ORDER BY us.best_streak DESC, us.current_streak DESC, us.games_won DESC) as ranking
        FROM user_scores us
        WHERE us.best_streak > 0
    `;

        let params = [];

        if (guildId) {
            query += ' AND us.guild_id = ?';
            params.push(guildId);
        } else {
            query += ' AND us.guild_id IS NULL';
        }

        query += `
        ORDER BY us.best_streak DESC, us.current_streak DESC, us.games_won DESC 
        LIMIT ?
    `;

        params.push(limit);

        const results = await executeQuery(query, params);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking
        }));
    }

    /**
     * Classement par activité - le plus de parties jouées
     */
    async getActivityLeaderboard(limit = 10, guildId = null) {
        let query = `
        SELECT 
            us.*,
            ROW_NUMBER() OVER (ORDER BY us.games_played DESC, us.games_won DESC) as ranking
        FROM user_scores us
        WHERE us.games_played > 0
    `;

        let params = [];

        if (guildId) {
            query += ' AND us.guild_id = ?';
            params.push(guildId);
        } else {
            query += ' AND us.guild_id IS NULL';
        }

        query += `
        ORDER BY us.games_played DESC, us.games_won DESC 
        LIMIT ?
    `;

        params.push(limit);

        const results = await executeQuery(query, params);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking
        }));
    }
}

module.exports = PlayerRepository;
