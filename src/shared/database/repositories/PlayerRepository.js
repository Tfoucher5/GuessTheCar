const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player');

class PlayerRepository extends BaseRepository {
    constructor() {
        super('user_scores'); // Table anglaise correcte
    }

    /**
     * Trouve un joueur par son ID Discord
     */
    async findByUserId(userId) {
        const results = await this.findWhere({ user_id: userId });
        if (results.length === 0) return null;
        return Player.fromDatabase(results[0]);
    }

    /**
     * Crée ou met à jour un joueur
     */
    async upsertPlayer(player) {
        const existing = await this.findByUserId(player.userId);
        if (existing) {
            return await this.updatePlayer(player);
        } else {
            return await this.createPlayer(player);
        }
    }

    /**
     * Crée un nouveau joueur
     */
    async createPlayer(player) {
        const data = player.toDatabase();
        const result = await this.create(data);
        return Player.fromDatabase({ ...data, id: result.id });
    }

    /**
     * Met à jour un joueur existant
     */
    async updatePlayer(player) {
        const data = player.toDatabase();
        delete data.user_id;
        delete data.created_at;
        await this.updateWhere({ user_id: player.userId }, data);
        return await this.findByUserId(player.userId);
    }

    /**
     * Met à jour les scores d'un joueur
     */
    async updatePlayerScore(userId, username, basePoints, difficultyPoints, isFullSuccess) {
        let player = await this.findByUserId(userId);
        if (!player) {
            player = new Player(userId, username);
        }
        player.addPoints(basePoints, difficultyPoints, isFullSuccess);
        return await this.upsertPlayer(player);
    }

    /**
     * Met à jour les statistiques de jeu d'un joueur
     */
    async updatePlayerGameStats(userId, attempts, gameTime) {
        const player = await this.findByUserId(userId);
        if (!player) {
            throw new Error(`Player with userId ${userId} not found`);
        }
        player.updateGameStats(attempts, gameTime);
        return await this.upsertPlayer(player);
    }

    /**
     * Obtient le classement des joueurs
     */
    async getLeaderboard(limit = 10) {
        const query = `
            SELECT * FROM user_scores
            WHERE total_difficulty_points > 0
            ORDER BY total_difficulty_points DESC, games_won DESC
            LIMIT ?
        `;
        const results = await executeQuery(query, [limit]);
        return results.map(row => Player.fromDatabase(row));
    }

    /**
     * Obtient les statistiques globales des joueurs
     */
    async getGlobalStats() {
        const query = `
            SELECT 
                COUNT(*) as totalPlayers,
                COUNT(CASE WHEN total_difficulty_points > 0 THEN 1 END) as activePlayers,
                COALESCE(SUM(games_won), 0) as totalCarsGuessed,
                COALESCE(SUM(games_played - games_won), 0) as totalPartialGuesses,
                COALESCE(SUM(total_difficulty_points), 0) as totalPoints,
                COALESCE(AVG(total_difficulty_points), 0) as avgPoints,
                MIN(average_response_time) as bestGlobalTime,
                MAX(total_difficulty_points) as highestScore
            FROM user_scores
        `;
        const results = await executeQuery(query);

        // Assurer que toutes les valeurs sont définies
        const stats = results[0];
        return {
            totalPlayers: stats.totalPlayers || 0,
            activePlayers: stats.activePlayers || 0,
            totalCarsGuessed: stats.totalCarsGuessed || 0,
            totalPartialGuesses: stats.totalPartialGuesses || 0,
            totalPoints: stats.totalPoints || 0,
            avgPoints: stats.avgPoints || 0,
            bestGlobalTime: stats.bestGlobalTime || null,
            highestScore: stats.highestScore || 0
        };
    }

    /**
     * Trouve les joueurs par nom (recherche partielle)
     */
    async searchPlayersByUsername(username, limit = 10) {
        const query = `
            SELECT * FROM user_scores
            WHERE username LIKE ?
            ORDER BY total_difficulty_points DESC
            LIMIT ?
        `;
        const results = await executeQuery(query, [`%${username}%`, limit]);
        return results.map(row => Player.fromDatabase(row));
    }

    /**
     * Obtient le rang d'un joueur
     */
    async getPlayerRank(userId) {
        const query = `
            SELECT COUNT(*) + 1 as rank
            FROM user_scores p1
            WHERE p1.total_difficulty_points > (
                SELECT COALESCE(p2.total_difficulty_points, 0)
                FROM user_scores p2 
                WHERE p2.user_id = ?
            )
        `;
        const results = await executeQuery(query, [userId]);
        return results[0]?.rank || null;
    }

    /**
     * Obtient les joueurs actifs récemment
     */
    async getRecentlyActivePlayers(days = 7, limit = 20) {
        const query = `
            SELECT * FROM user_scores
            WHERE updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY updated_at DESC
            LIMIT ?
        `;
        const results = await executeQuery(query, [days, limit]);
        return results.map(row => Player.fromDatabase(row));
    }
}

module.exports = PlayerRepository;