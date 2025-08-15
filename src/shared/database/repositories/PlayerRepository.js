const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player'); // IMPORT CORRIGÉ !

class PlayerRepository extends BaseRepository {
    constructor() {
        super('user_scores'); // Table anglaise !
    }

    async findByUserId(userId) {
        const results = await this.findWhere({ user_id: userId });
        if (results.length === 0) return null;
        return Player.fromDatabase(results[0]);
    }

    async upsertPlayer(player) {
        const existing = await this.findByUserId(player.userId);
        if (existing) {
            return await this.updatePlayer(player);
        } else {
            return await this.createPlayer(player);
        }
    }

    async createPlayer(player) {
        const data = player.toDatabase();
        const result = await this.create(data);
        return Player.fromDatabase({ ...data, id: result.id });
    }

    async updatePlayer(player) {
        const data = player.toDatabase();
        delete data.user_id;
        delete data.created_at;
        await this.updateWhere({ user_id: player.userId }, data);
        return await this.findByUserId(player.userId);
    }

    async updatePlayerScore(userId, username, basePoints, difficultyPoints, isFullSuccess) {
        let player = await this.findByUserId(userId);
        if (!player) {
            player = new Player(userId, username);
        }
        player.addPoints(basePoints, difficultyPoints, isFullSuccess);
        return await this.upsertPlayer(player);
    }

    async getLeaderboard(limit = 10) {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE total_difficulty_points > 0
            ORDER BY total_difficulty_points DESC, games_won DESC
            LIMIT ?
        `;
        const results = await executeQuery(query, [limit]);
        return results.map(row => Player.fromDatabase(row));
    }

    async getGlobalStats() {
        const query = `
            SELECT 
                COUNT(*) as totalPlayers,
                COUNT(CASE WHEN total_difficulty_points > 0 THEN 1 END) as activePlayers,
                SUM(games_won) as totalCarsGuessed,
                SUM(games_played - games_won) as totalPartialGuesses,
                SUM(total_difficulty_points) as totalPoints,
                AVG(total_difficulty_points) as avgPoints,
                MIN(average_response_time) as bestGlobalTime,
                MAX(total_difficulty_points) as highestScore
            FROM ${this.tableName}
        `;
        const results = await executeQuery(query);
        return results[0];
    }

    async searchPlayersByUsername(username, limit = 10) {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE username LIKE ?
            ORDER BY total_difficulty_points DESC
            LIMIT ?
        `;
        const results = await executeQuery(query, [`%${username}%`, limit]);
        return results.map(row => Player.fromDatabase(row));
    }

    async getPlayerRank(userId) {
        const query = `
            SELECT COUNT(*) + 1 as rank
            FROM ${this.tableName} p1
            WHERE p1.total_difficulty_points > (
                SELECT p2.total_difficulty_points 
                FROM ${this.tableName} p2 
                WHERE p2.user_id = ?
            )
        `;
        const results = await executeQuery(query, [userId]);
        return results[0]?.rank || null;
    }

    async getRecentlyActivePlayers(days = 7, limit = 20) {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY updated_at DESC
            LIMIT ?
        `;
        const results = await executeQuery(query, [days, limit]);
        return results.map(row => Player.fromDatabase(row));
    }
}

module.exports = PlayerRepository;