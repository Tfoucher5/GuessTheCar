#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('./src/shared/utils/logger');

async function fixDatabase() {
    console.log('🔧 Correction de la base de données...\n');

    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'guessthecar',
        timeout: 60000
    };

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        connectionConfig.password = process.env.DB_PASSWORD;
    }

    let connection;
    try {
        connection = await mysql.createConnection(connectionConfig);
        console.log('✅ Connexion établie');

        // Vérification des tables critiques
        const tables = ['brands', 'models', 'user_scores'];
        for (const table of tables) {
            try {
                const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`✅ Table ${table}: ${rows[0].count} entrées`);
            } catch (error) {
                console.log(`❌ Problème avec la table ${table}: ${error.message}`);
            }
        }

        // Optimisation des tables
        console.log('\n🔧 Optimisation des tables...');
        for (const table of tables) {
            try {
                await connection.execute(`OPTIMIZE TABLE ${table}`);
                console.log(`✅ Table ${table} optimisée`);
            } catch (error) {
                console.log(`⚠️  Impossible d'optimiser ${table}: ${error.message}`);
            }
        }

        console.log('\n✅ Vérification terminée');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    fixDatabase();
}

module.exports = fixDatabase;