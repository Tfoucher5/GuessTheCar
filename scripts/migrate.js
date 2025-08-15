#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
    console.log('🗄️  Création de la base de données...\n');

    // Configuration simple sans options deprecated
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root'
    };

    // Ajouter le mot de passe seulement s'il n'est pas vide
    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        connectionConfig.password = process.env.DB_PASSWORD;
    }

    console.log('📡 Connexion à MySQL...');
    const connection = await mysql.createConnection(connectionConfig);

    try {
        // Créer la base de données si elle n'existe pas
        const dbName = process.env.DB_NAME || 'guessthecar';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Base de données '${dbName}' créée`);

        // Se connecter à la base
        await connection.changeUser({ database: dbName });
        console.log('✅ Connexion à la base établie');

        // Créer les tables
        console.log('📋 Création des tables...');

        // Table des marques
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS brands (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table brands créée');

        // Table des modèles
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS models (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                brand_id INT NOT NULL,
                difficulty_level INT DEFAULT 1,
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
                UNIQUE KEY unique_brand_model (brand_id, name)
            )
        `);
        console.log('✅ Table models créée');

        // Table des scores utilisateurs
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS user_scores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(20) NOT NULL UNIQUE,
                username VARCHAR(100) NOT NULL,
                total_points INT DEFAULT 0,
                total_difficulty_points INT DEFAULT 0,
                games_played INT DEFAULT 0,
                games_won INT DEFAULT 0,
                correct_brand_guesses INT DEFAULT 0,
                correct_model_guesses INT DEFAULT 0,
                total_brand_guesses INT DEFAULT 0,
                total_model_guesses INT DEFAULT 0,
                best_streak INT DEFAULT 0,
                current_streak INT DEFAULT 0,
                average_response_time DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table user_scores créée');

        // Table des sessions de jeu
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS game_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(20) NOT NULL,
                channel_id VARCHAR(20) NOT NULL,
                model_id INT NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP NULL,
                status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
                brand_guessed BOOLEAN DEFAULT FALSE,
                model_guessed BOOLEAN DEFAULT FALSE,
                points_earned INT DEFAULT 0,
                FOREIGN KEY (model_id) REFERENCES models(id),
                INDEX idx_user_status (user_id, status),
                INDEX idx_channel_active (channel_id, status)
            )
        `);
        console.log('✅ Table game_sessions créée');

        console.log('\n🎉 Migration terminée avec succès!');
        console.log('\n📊 Tables créées:');
        console.log('- brands (marques de voitures)');
        console.log('- models (modèles de voitures)');
        console.log('- user_scores (scores des joueurs)');
        console.log('- game_sessions (sessions de jeu)');

        console.log('\n🚀 Prochaine étape: npm run seed');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    createDatabase().catch(console.error);
}

module.exports = createDatabase;