// src/shared/database/connection.js
require('dotenv').config();
const { Client } = require('pg');
const logger = require('../utils/logger');

let client = null;

async function initializeDatabase() {
    if (client) {
        return client;
    }

    try {
        client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        await client.connect();
        logger.info('✅ PostgreSQL database connected via Supabase');
        return client;
    } catch (error) {
        logger.error('❌ Failed to connect to PostgreSQL:', error.message);
        throw error;
    }
}

async function executeQuery(query, params = []) {
    try {
        if (!client) {
            await initializeDatabase();
        }
        const res = await client.query(query, params);
        return res.rows;
    } catch (error) {
        logger.error('Database query error:', {
            query: query.replace(/\s+/g, ' ').trim(),
            params,
            error: error.message
        });
        throw error;
    }
}

async function closeDatabase() {
    if (client) {
        await client.end();
        client = null;
        logger.info('Database connection closed');
    }
}

module.exports = {
    initializeDatabase,
    executeQuery,
    closeDatabase
};
