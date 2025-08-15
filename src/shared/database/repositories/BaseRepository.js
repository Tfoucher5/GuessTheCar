const { executeQuery, executeTransaction } = require('../connection');
const { DatabaseError, NotFoundError } = require('../../errors');
const logger = require('../../utils/logger');

class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    /**
     * Trouve un enregistrement par ID
     */
    async findById(id, columns = '*') {
        const query = `SELECT ${columns} FROM ${this.tableName} WHERE id = ?`;
        const results = await executeQuery(query, [id]);

        if (results.length === 0) {
            return null;
        }

        return results[0];
    }

    /**
     * Trouve tous les enregistrements
     */
    async findAll(columns = '*', orderBy = 'id ASC', limit = null) {
        let query = `SELECT ${columns} FROM ${this.tableName} ORDER BY ${orderBy}`;

        if (limit) {
            query += ` LIMIT ${limit}`;
        }

        return await executeQuery(query);
    }

    /**
     * Trouve des enregistrements selon des critères
     */
    async findWhere(conditions, columns = '*', orderBy = 'id ASC') {
        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(conditions);

        const query = `SELECT ${columns} FROM ${this.tableName} WHERE ${whereClause} ORDER BY ${orderBy}`;
        return await executeQuery(query, values);
    }

    /**
     * Trouve un seul enregistrement selon des critères
     */
    async findOneWhere(conditions, columns = '*') {
        const results = await this.findWhere(conditions, columns);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Crée un nouvel enregistrement
     */
    async create(data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
        const result = await executeQuery(query, values);

        return {
            id: result.insertId,
            ...data
        };
    }

    /**
     * Met à jour un enregistrement
     */
    async update(id, data) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        const result = await executeQuery(query, values);

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Record with id ${id} not found in ${this.tableName}`);
        }

        return await this.findById(id);
    }

    /**
     * Met à jour selon des critères
     */
    async updateWhere(conditions, data) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const values = [...Object.values(data), ...Object.values(conditions)];

        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`;
        const result = await executeQuery(query, values);

        return result.affectedRows;
    }

    /**
     * Supprime un enregistrement
     */
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await executeQuery(query, [id]);

        if (result.affectedRows === 0) {
            throw new NotFoundError(`Record with id ${id} not found in ${this.tableName}`);
        }

        return true;
    }

    /**
     * Supprime selon des critères
     */
    async deleteWhere(conditions) {
        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(conditions);

        const query = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        const result = await executeQuery(query, values);

        return result.affectedRows;
    }

    /**
     * Compte les enregistrements
     */
    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        let values = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            values = Object.values(conditions);
            query += ` WHERE ${whereClause}`;
        }

        const result = await executeQuery(query, values);
        return result[0].count;
    }

    /**
     * Vérifie si un enregistrement existe
     */
    async exists(conditions) {
        const count = await this.count(conditions);
        return count > 0;
    }
}

module.exports = BaseRepository;