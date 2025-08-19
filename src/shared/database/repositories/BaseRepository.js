// src/shared/database/repositories/BaseRepository.js
const { executeQuery } = require('../connection');

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    /**
     * Trouve tous les enregistrements
     */
    async findAll(conditions = {}, limit = null, offset = null) {
        let query = `SELECT * FROM ${this.tableName}`;
        let values = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            values = Object.values(conditions);
            query += ` WHERE ${whereClause}`;
        }

        if (limit) {
            query += ` LIMIT ${limit}`;
            if (offset) {
                query += ` OFFSET ${offset}`;
            }
        }

        const results = await executeQuery(query, values);
        return results;
    }

    /**
     * Trouve un enregistrement par ID
     */
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const results = await executeQuery(query, [id]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Trouve un enregistrement selon des critères
     */
    async findOne(conditions) {
        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(conditions);

        const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
        const results = await executeQuery(query, values);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Crée un nouvel enregistrement
     * CORRECTION: Utiliser les noms de colonnes au lieu des index
     */
    async create(data) {
        // Filtrer les valeurs undefined et null pour les colonnes optionnelles
        const cleanData = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                cleanData[key] = data[key];
            } else {
                // Ne pas inclure les clés undefined dans l'INSERT
                // ou les convertir en null si nécessaire
            }
        });

        const columns = Object.keys(cleanData);
        const placeholders = columns.map(() => '?');
        const values = Object.values(cleanData);

        // CORRECTION: Utiliser les vrais noms de colonnes
        const columnsStr = columns.join(', ');
        const placeholdersStr = placeholders.join(', ');

        const query = `INSERT INTO ${this.tableName} (${columnsStr}) VALUES (${placeholdersStr})`;

        try {
            const result = await executeQuery(query, values);

            return {
                id: result.insertId,
                ...cleanData
            };
        } catch (error) {
            // Log pour debug
            console.error('BaseRepository.create error:', {
                query,
                values,
                tableName: this.tableName,
                columns: columnsStr,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Met à jour un enregistrement
     */
    async update(id, data) {
        // Filtrer les valeurs undefined
        const cleanData = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                cleanData[key] = data[key];
            }
        });

        const setClause = Object.keys(cleanData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(cleanData), id];

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
        // Filtrer les valeurs undefined
        const cleanData = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                cleanData[key] = data[key];
            }
        });

        const setClause = Object.keys(cleanData).map(key => `${key} = ?`).join(', ');
        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const values = [...Object.values(cleanData), ...Object.values(conditions)];

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

        const results = await executeQuery(query, values);
        return results[0].count;
    }

    /**
      * Vérifie si un enregistrement existe
      */
    async exists(conditions) {
        const count = await this.count(conditions);
        return count > 0;
    }

    /**
     * Méthode utilitaire pour nettoyer les données avant insertion/mise à jour
     */
    cleanData(data, allowedFields = null) {
        const cleaned = {};

        Object.keys(data).forEach(key => {
            const value = data[key];

            // Ignorer les valeurs undefined
            if (value === undefined) return;

            // Si une liste de champs autorisés est fournie, la respecter
            if (allowedFields && !allowedFields.includes(key)) return;

            cleaned[key] = value;
        });

        return cleaned;
    }
}

module.exports = BaseRepository;
