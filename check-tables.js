#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTableStructure() {
    console.log('🔍 Vérification de la structure des tables...\n');

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
        // Vérifier la structure de la table brands
        console.log('📋 Structure de la table brands:');
        const [brandsStructure] = await connection.execute('DESCRIBE brands');
        brandsStructure.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        console.log('\n📋 Structure de la table models:');
        const [modelsStructure] = await connection.execute('DESCRIBE models');
        modelsStructure.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        console.log('\n📋 Structure de la table user_scores:');
        const [userStructure] = await connection.execute('DESCRIBE user_scores');
        userStructure.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Lister toutes les tables
        console.log('\n📊 Toutes les tables de la base:');
        const [tables] = await connection.execute('SHOW TABLES');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  - ${tableName}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

checkTableStructure();