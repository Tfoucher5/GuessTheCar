#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    const configs = [
        { password: '', label: 'Pas de mot de passe' },
        { password: 'root', label: 'Mot de passe: root' },
        { password: 'password', label: 'Mot de passe: password' },
        { password: 'admin', label: 'Mot de passe: admin' },
        { password: 'xampp', label: 'Mot de passe: xampp' }
    ];

    console.log('🔍 Test de connexion MySQL XAMPP...\n');

    for (const config of configs) {
        try {
            console.log(`📡 Test: ${config.label}`);

            const connection = await mysql.createConnection({
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: config.password,
                connectTimeout: 5000
            });

            console.log('✅ CONNEXION RÉUSSIE !');
            console.log(`🔑 Mot de passe correct: "${config.password}"`);
            console.log('📝 Mets à jour ton .env avec:');
            console.log(`DB_PASSWORD=${config.password}`);

            await connection.end();
            return;

        } catch (error) {
            console.log(`❌ Échec: ${error.message}`);
        }
    }

    console.log('\n🚨 Aucune configuration n\'a fonctionné !');
    console.log('\n🛠️  Solutions:');
    console.log('1. Assure-toi que MySQL est démarré dans XAMPP');
    console.log('2. Va sur http://localhost/phpmyadmin pour vérifier');
    console.log('3. Réinitialise le mot de passe MySQL (voir script reset)');
}

testConnection().catch(console.error);