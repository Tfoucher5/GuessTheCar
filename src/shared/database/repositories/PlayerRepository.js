const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player');

class PlayerRepository extends BaseRepository {
    constructor() {
        super('players');
    }

    /**
     * Trouve un joueur par son ID Discord
     */
    async findByUserId(userId) {
        const results = await this.findWhere({ user_id: userId });
        if (results.length === 0) {
            return null;
        }
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
        delete data.user_id; // Ne pas mettre à jour l'ID utilisateur
        delete data.created_at; // Ne pas mettre à jour la date de création

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
            SELECT * FROM ${this.tableName}
            WHERE total_difficulty_points > 0
            ORDER BY total_difficulty_points DESC, cars_guessed DESC, best_time ASC
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
                SUM(cars_guessed) as totalCarsGuessed,
                SUM(partial_guesses) as totalPartialGuesses,
                SUM(total_difficulty_points) as totalPoints,
                AVG(total_difficulty_points) as avgPoints,
                MIN(best_time) as bestGlobalTime,
                MAX(total_difficulty_points) as highestScore
            FROM ${this.tableName}
        `;

        const results = await executeQuery(query);
        return results[0];
    }

    /**
     * Trouve les joueurs par nom (recherche partielle)
     */
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

    /**
     * Obtient le rang d'un joueur
     */
    async getPlayerRank(userId) {
        const query = `
            SELECT COUNT(*) + 1 as rank
            FROM ${this.tableName} p1
            WHERE p1.total_difficulty_points > (
                SELECT p2.total_difficulty_points 
                FROM ${this.tableName} p2 
                WHERE p2.user_id = ?
            )
            OR (
                p1.total_difficulty_points = (
                    SELECT p2.total_difficulty_points 
                    FROM ${this.tableName} p2 
                    WHERE p2.user_id = ?
                )
                AND p1.cars_guessed > (
                    SELECT p2.cars_guessed 
                    FROM ${this.tableName} p2 
                    WHERE p2.user_id = ?
                )
            )
        `;

        const results = await executeQuery(query, [userId, userId, userId]);
        return results[0]?.rank || null;
    }

    /**
     * Obtient les joueurs actifs récemment
     */
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
