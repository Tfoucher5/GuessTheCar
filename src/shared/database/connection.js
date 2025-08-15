const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');
const logger = require('../utils/logger');
const { DatabaseError } = require('../errors');

let pool = null;

/**
 * Initialise la connexion à la base de données
 */
async function initializeDatabase() {
    try {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            queueLimit: 0
        });

        // Test de connexion
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        logger.info('Database connection pool created successfully');
        return pool;
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw new DatabaseError('Failed to connect to database', error);
    }
}

/**
 * Obtient le pool de connexions
 */
function getPool() {
    if (!pool) {
        throw new DatabaseError('Database not initialized. Call initializeDatabase() first.');
    }
    return pool;
}

/**
 * Exécute une requête avec gestion d'erreur
 */
async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        logger.error('Database query error:', { query, params, error: error.message });
        throw new DatabaseError(`Query execution failed: ${error.message}`, error);
    }
}

/**
 * Exécute une transaction
 */
async function executeTransaction(queries) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }

        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        logger.error('Transaction failed:', error);
        throw new DatabaseError(`Transaction failed: ${error.message}`, error);
    } finally {
        connection.release();
    }
}

/**
 * Ferme proprement le pool de connexions
 */
async function closeDatabase() {
    if (pool) {
        await pool.end();
        logger.info('Database connection pool closed');
    }
}

module.exports = {
    initializeDatabase,
    getPool,
    executeQuery,
    executeTransaction,
    closeDatabase
};