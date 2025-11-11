// src/shared/database/repositories/BaseRepository.js
const { supabase } = require('../connection');

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
        let query = supabase
            .from(this.tableName)
            .select('*');

        // Appliquer les conditions
        Object.entries(conditions).forEach(([key, value]) => {
            if (value === null) {
                query = query.is(key, null);
            } else {
                query = query.eq(key, value);
            }
        });

        // Appliquer la limite et l'offset
        if (limit) {
            query = query.limit(limit);
        }
        if (offset) {
            query = query.range(offset, offset + (limit || 10) - 1);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    }

    /**
     * Trouve un enregistrement par ID
     */
    async findById(id) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data || null;
    }

    /**
     * Trouve un enregistrement selon des critères
     */
    async findOne(conditions) {
        let query = supabase
            .from(this.tableName)
            .select('*');

        // Appliquer les conditions
        Object.entries(conditions).forEach(([key, value]) => {
            if (value === null) {
                query = query.is(key, null);
            } else {
                query = query.eq(key, value);
            }
        });

        const { data, error } = await query
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
    }

    /**
     * Crée un nouvel enregistrement
     */
    async create(data) {
        // Filtrer les valeurs undefined
        const cleanData = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                cleanData[key] = data[key];
            }
        });

        try {
            const { data: result, error } = await supabase
                .from(this.tableName)
                .insert(cleanData)
                .select()
                .single();

            if (error) throw error;
            return result;
        } catch (error) {
            console.error('BaseRepository.create error:', {
                tableName: this.tableName,
                data: cleanData,
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

        const { data: result, error } = await supabase
            .from(this.tableName)
            .update(cleanData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundError(`Record with id ${id} not found in ${this.tableName}`);
            }
            throw error;
        }

        return result;
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

        let query = supabase
            .from(this.tableName)
            .update(cleanData);

        // Appliquer les conditions
        Object.entries(conditions).forEach(([key, value]) => {
            if (value === null) {
                query = query.is(key, null);
            } else {
                query = query.eq(key, value);
            }
        });

        const { data: result, error, count } = await query
            .select('*', { count: 'exact' });

        if (error) throw error;
        return count || 0;
    }

    /**
     * Supprime un enregistrement
     */
    async delete(id) {
        const { error, count } = await supabase
            .from(this.tableName)
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) throw error;

        if (count === 0) {
            throw new NotFoundError(`Record with id ${id} not found in ${this.tableName}`);
        }

        return true;
    }

    /**
     * Supprime selon des critères
     */
    async deleteWhere(conditions) {
        let query = supabase
            .from(this.tableName)
            .delete({ count: 'exact' });

        // Appliquer les conditions
        Object.entries(conditions).forEach(([key, value]) => {
            if (value === null) {
                query = query.is(key, null);
            } else {
                query = query.eq(key, value);
            }
        });

        const { error, count } = await query;
        if (error) throw error;

        return count || 0;
    }

    /**
     * Compte les enregistrements
     */
    async count(conditions = {}) {
        let query = supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true });

        // Appliquer les conditions
        Object.entries(conditions).forEach(([key, value]) => {
            if (value === null) {
                query = query.is(key, null);
            } else {
                query = query.eq(key, value);
            }
        });

        const { count, error } = await query;
        if (error) throw error;

        return count || 0;
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
