const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player');

class PlayerRepository extends BaseRepository {
    constructor() {
        super('user_scores');
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
     * Crée un nouveau joueur
     */
    async create(userId, username) {
        const query = `
            INSERT INTO user_scores (user_id, username) 
            VALUES (?, ?)
        `;

        const result = await executeQuery(query, [userId, username]);

        // Récupérer le joueur créé
        return await this.findByUserId(userId);
    }

    /**
 * Met à jour les statistiques d'un joueur
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
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    `;

        const params = [
            stats.username,
            stats.total_points || 0,
            stats.total_difficulty_points || 0,
            stats.games_played || 0,
            stats.games_won || 0,
            stats.correct_brand_guesses || 0,
            stats.correct_model_guesses || 0,
            stats.total_brand_guesses || 0,
            stats.total_model_guesses || 0,
            stats.best_streak || 0,
            stats.current_streak || 0,
            stats.best_time || null,
            userId
        ];

        await executeQuery(query, params);
        return await this.findByUserId(userId);
    }

    /**
     * Récupère le classement des joueurs
     */
    async getLeaderboard(limit = 10) {
        const query = `
            SELECT *
            FROM leaderboard_view
            ORDER BY ranking ASC
            LIMIT ?
        `;

        const results = await executeQuery(query, [limit]);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking,
            skillLevel: row.skill_level,
            successRate: parseFloat(row.success_rate) || 0,
            averageAttempts: parseFloat(row.average_attempts) || 0,
            averageTime: parseFloat(row.average_time_seconds) || 0
        }));
    }

    /**
     * Obtient les statistiques d'un joueur avec son classement
     */
    async getPlayerWithRanking(userId) {
        const query = `
            SELECT *
            FROM leaderboard_view
            WHERE user_id = ?
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
            successRate: parseFloat(row.success_rate) || 0,
            averageAttempts: parseFloat(row.average_attempts) || 0,
            averageTime: parseFloat(row.average_time_seconds) || 0
        };
    }

    /**
     * Obtient ou crée un joueur
     */
    async findOrCreate(userId, username) {
        let player = await this.findByUserId(userId);

        if (!player) {
            player = await this.create(userId, username);
        } else if (player.username !== username) {
            // Mettre à jour le nom d'utilisateur si nécessaire
            player.username = username;
            await this.updatePlayerStats(userId, player);
        }

        return player;
    }

    /**
     * Enregistre une session de jeu
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

        const params = [
            sessionData.userId,
            sessionData.carId,
            sessionData.startedAt,
            sessionData.endedAt,
            sessionData.durationSeconds,
            sessionData.attemptsMake || 0,
            sessionData.attemptsModel || 0,
            sessionData.makeFound || false,
            sessionData.modelFound || false,
            sessionData.completed || false,
            sessionData.abandoned || false,
            sessionData.timeout || false,
            sessionData.carChangesUsed || 0,
            sessionData.hintsUsed ? JSON.stringify(sessionData.hintsUsed) : null,
            sessionData.pointsEarned || 0,
            sessionData.difficultyPointsEarned || 0
        ];

        const result = await executeQuery(query, params);
        return result.insertId;
    }

    /**
     * Obtient les statistiques globales
     */
    async getGlobalStats() {
        const query = `
            SELECT 
                COUNT(*) as totalPlayers,
                SUM(games_played) as totalGames,
                SUM(games_won) as totalWins,
                AVG(total_difficulty_points) as avgPoints,
                MAX(total_difficulty_points) as maxPoints,
                AVG(CASE WHEN games_played > 0 THEN (games_won / games_played) * 100 ELSE 0 END) as globalSuccessRate
            FROM user_scores
            WHERE total_difficulty_points > 0
        `;

        const results = await executeQuery(query);
        return results[0];
    }
}

module.exports = PlayerRepository;
