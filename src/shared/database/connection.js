// src/shared/database/connection.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let pool = null;

async function initializeDatabase() {
    if (pool) {
        return pool;
    }

    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'guessthecar',
        // Configuration du pool - SEULEMENT les options valides pour mysql2
        connectionLimit: 10,
        queueLimit: 0
        // SUPPRIMÉ: idleTimeout: 60000, (invalide pour les pools)
        // SUPPRIMÉ: acquireTimeout: 60000 (invalide pour les pools)
    };

    // Mot de passe optionnel
    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        config.password = process.env.DB_PASSWORD;
    }

    try {
        pool = mysql.createPool(config);

        // Test de connexion
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        logger.info('✅ Database pool initialized');
        return pool;
    } catch (error) {
        logger.error('❌ Failed to initialize database pool:', error);
        throw error;
    }
}

async function executeQuery(query, params = []) {
    try {
        if (!pool) {
            await initializeDatabase();
        }

        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        logger.error('Database query error:', {
            query: query.replace(/\s+/g, ' ').trim(),
            params,
            error: error.message
        });

        // Retry une fois en cas d'erreur de connexion
        if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
            logger.info('Retrying query after connection error...');
            try {
                const [results] = await pool.execute(query, params);
                return results;
            } catch (retryError) {
                throw new DatabaseError(`Query failed after retry: ${retryError.message}`, retryError);
            }
        }

        throw new DatabaseError(`Query execution failed: ${error.message}`, error);
    }
}

async function closeDatabase() {
    if (pool) {
        await pool.end();
        pool = null;
        logger.info('Database pool closed');
    }
}

class DatabaseError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'DatabaseError';
        this.statusCode = 500;
        this.isOperational = true;
        this.code = 'DATABASE_ERROR';
        this.originalError = originalError;
    }
}

module.exports = {
    executeQuery,
    initializeDatabase,
    closeDatabase,
    DatabaseError
};
