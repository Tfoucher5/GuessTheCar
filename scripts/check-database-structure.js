#!/usr/bin/env node
/* eslint-disable no-undef */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabaseStructure() {
    console.log('🔍 Vérification de la structure de la base de données...\n');

    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'guessthecar'
    };

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        connectionConfig.password = process.env.DB_PASSWORD;
    }

    const connection = await mysql.createConnection(connectionConfig);

    try {
        // Lister toutes les tables
        console.log('📊 Tables existantes dans la base:');
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(table => Object.values(table)[0]);

        tableNames.forEach(table => {
            console.log(`  ✓ ${table}`);
        });

        console.log('\n' + '='.repeat(50));

        // Vérifier chaque table importante
        const importantTables = ['brands', 'models', 'user_scores', 'game_sessions'];

        for (const tableName of importantTables) {
            if (tableNames.includes(tableName)) {
                console.log(`\n📋 Structure de la table ${tableName}:`);
                const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
                structure.forEach(col => {
                    const nullable = col.Null === 'YES' ? '(nullable)' : '(NOT NULL)';
                    const defaultVal = col.Default !== null ? ` [default: ${col.Default}]` : '';
                    console.log(`  - ${col.Field}: ${col.Type} ${nullable}${defaultVal}`);
                });
            } else {
                console.log(`\n❌ Table ${tableName} MANQUANTE`);
            }
        }

        // Vérifier les tables optionnelles
        console.log('\n' + '='.repeat(50));
        console.log('\n📋 Tables optionnelles:');

        const optionalTables = ['game_attempts', 'sessions', 'logs'];
        for (const tableName of optionalTables) {
            if (tableNames.includes(tableName)) {
                console.log(`  ✓ ${tableName} existe`);
            } else {
                console.log(`  ❌ ${tableName} n'existe pas`);
            }
        }

        // Compter les données
        console.log('\n' + '='.repeat(50));
        console.log('\n📈 Nombre d\'enregistrements:');

        for (const tableName of tableNames) {
            try {
                const [count] = await connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
                console.log(`  ${tableName}: ${count[0].total} enregistrements`);
            } catch (error) {
                console.log(`  ${tableName}: Erreur lors du comptage (${error.message})`);
            }
        }

        // Recommandations
        console.log('\n' + '='.repeat(50));
        console.log('\n💡 Recommandations pour l\'admin:');

        if (!tableNames.includes('game_attempts')) {
            console.log('  - Créer la table game_attempts pour tracker les tentatives de jeu');
        }

        // Vérifier les colonnes de user_scores
        if (tableNames.includes('user_scores')) {
            const [userCols] = await connection.execute('DESCRIBE user_scores');
            const colNames = userCols.map(col => col.Field);

            if (!colNames.includes('correct_answers')) {
                console.log('  - Ajouter la colonne correct_answers à user_scores');
            }
            if (!colNames.includes('total_games')) {
                console.log('  - Ajouter la colonne total_games à user_scores');
            }
            if (!colNames.includes('games_played')) {
                console.log('  - user_scores utilise games_played au lieu de total_games');
            }
        }

        console.log('\n✅ Vérification terminée!');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    checkDatabaseStructure();
}

module.exports = { checkDatabaseStructure };