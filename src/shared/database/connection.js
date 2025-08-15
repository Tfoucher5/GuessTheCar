// src/shared/database/connection.js - VERSION CORRIGÉE

require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let connection = null;

/**
 * Initialise la connexion à la base de données
 */
async function initializeDatabase() {
    if (connection) {
        return connection; // Déjà initialisée
    }

    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'guessthecar'
    };

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        config.password = process.env.DB_PASSWORD;
    }

    try {
        connection = await mysql.createConnection(config);
        logger.info('Database connection initialized');
        return connection;
    } catch (error) {
        logger.error('Failed to initialize database connection:', error);
        throw error;
    }
}

/**
 * Exécute une requête SQL
 */
async function executeQuery(query, params = []) {
    try {
        // S'assurer que la connexion est initialisée
        if (!connection) {
            await initializeDatabase();
        }

        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        logger.error('Database query error:', {
            query: query.replace(/\s+/g, ' ').trim(),
            params,
            error: error.message
        });
        
        // Si connexion fermée, essayer de reconnecter
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            logger.info('Reconnecting to database...');
            connection = null;
            await initializeDatabase();
            const [results] = await connection.execute(query, params);
            return results;
        }
        
        throw new DatabaseError(`Query execution failed: ${error.message}`, error);
    }
}

/**
 * Ferme la connexion à la base de données
 */
async function closeConnection() {
    if (connection) {
        await connection.end();
        connection = null;
        logger.info('Database connection closed');
    }
}

/**
 * Classe d'erreur pour les erreurs de base de données
 */
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
    closeConnection,
    DatabaseError
};