#!/usr/bin/env node
/* eslint-disable no-undef */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
    console.log('🗄️  Création de la base de données...\n');

    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root'
    };

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        connectionConfig.password = process.env.DB_PASSWORD;
    }

    console.log('📡 Connexion à MySQL...');
    const connection = await mysql.createConnection(connectionConfig);

    try {
        const dbName = process.env.DB_NAME || 'guessthecar';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Base de données '${dbName}' créée`);

        await connection.changeUser({ database: dbName });
        console.log('✅ Connexion à la base établie');

        console.log('🧹 Suppression des anciennes tables...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('DROP TABLE IF EXISTS game_sessions');
        await connection.execute('DROP TABLE IF EXISTS user_cars_found');
        await connection.execute('DROP TABLE IF EXISTS user_scores');
        await connection.execute('DROP TABLE IF EXISTS models');
        await connection.execute('DROP TABLE IF EXISTS brands');
        await connection.execute('DROP VIEW IF EXISTS leaderboard_view');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('📋 Création des tables...');

        // Table des marques AVEC country
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS brands (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                country VARCHAR(50) NOT NULL DEFAULT 'Inconnu',
                logo_url VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_country (country)
            )
        `);
        console.log('✅ Table brands créée');

        // Table des modèles SANS FK
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS models (
                id INT AUTO_INCREMENT PRIMARY KEY,
                brand_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                year YEAR DEFAULT 2024,
                difficulty_level TINYINT NOT NULL DEFAULT 1,
                image_url VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_brand_id (brand_id),
                INDEX idx_difficulty (difficulty_level),
                INDEX idx_year (year)
            )
        `);
        console.log('✅ Table models créée');

        // Table des scores utilisateurs AVEC guild_id
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS user_scores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(20) NOT NULL,
                guild_id VARCHAR(255) NULL,
                username VARCHAR(32) NOT NULL,
                total_points DECIMAL(10, 2) DEFAULT 0,
                total_difficulty_points DECIMAL(10, 2) DEFAULT 0,
                games_played INT DEFAULT 0,
                games_won INT DEFAULT 0,
                correct_brand_guesses INT DEFAULT 0,
                correct_model_guesses INT DEFAULT 0,
                total_brand_guesses INT DEFAULT 0,
                total_model_guesses INT DEFAULT 0,
                best_streak INT DEFAULT 0,
                current_streak INT DEFAULT 0,
                best_time INT DEFAULT NULL,
                average_response_time DECIMAL(8, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_guild_id (guild_id),
                INDEX idx_guild_user (guild_id, user_id),
                INDEX idx_total_points (total_points DESC),
                INDEX idx_total_difficulty_points (total_difficulty_points DESC),
                INDEX idx_games_won (games_won DESC),
                INDEX idx_updated_at (updated_at),
                UNIQUE KEY unique_user_guild (user_id, guild_id)
            )
        `);
        console.log('✅ Table user_scores créée avec guild_id');

        // Table user_cars_found AVEC guild_id
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS user_cars_found (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                guild_id VARCHAR(255) NULL,
                car_id INT NOT NULL,
                brand_id INT NOT NULL,
                found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                attempts_used INT DEFAULT 0,
                time_taken INT DEFAULT 0,
                INDEX idx_user_id (user_id),
                INDEX idx_guild_id (guild_id),
                INDEX idx_guild_user (guild_id, user_id),
                INDEX idx_car_id (car_id),
                INDEX idx_brand_id (brand_id),
                UNIQUE KEY unique_user_guild_car (user_id, guild_id, car_id)
            )
        `);
        console.log('✅ Table user_cars_found créée avec guild_id');

        // Table des sessions AVEC guild_id
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS game_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(20) NOT NULL,
                guild_id VARCHAR(255) NULL,
                car_id INT NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP NULL,
                duration_seconds INT DEFAULT NULL,
                attempts_make INT DEFAULT 0,
                attempts_model INT DEFAULT 0,
                make_found BOOLEAN DEFAULT FALSE,
                model_found BOOLEAN DEFAULT FALSE,
                completed BOOLEAN DEFAULT FALSE,
                abandoned BOOLEAN DEFAULT FALSE,
                timeout BOOLEAN DEFAULT FALSE,
                car_changes_used INT DEFAULT 0,
                hints_used JSON DEFAULT NULL,
                points_earned DECIMAL(6, 2) DEFAULT 0,
                difficulty_points_earned DECIMAL(6, 2) DEFAULT 0,
                INDEX idx_user_id (user_id),
                INDEX idx_guild_id (guild_id),
                INDEX idx_guild_user (guild_id, user_id),
                INDEX idx_started_at (started_at),
                INDEX idx_car_id (car_id),
                INDEX idx_completed (completed)
            )
        `);
        console.log('✅ Table game_sessions créée avec guild_id');

        // Vue corrigée pour le nouveau système de points
        await connection.execute(`
            CREATE OR REPLACE VIEW leaderboard_view AS
            SELECT
                us.*,
                RANK() OVER (
                    ORDER BY
                        us.total_points DESC,
                        us.games_won DESC,
                        us.best_time ASC
                ) as ranking,
                CASE
                    WHEN us.total_points >= 100 THEN 'Expert'
                    WHEN us.total_points >= 50 THEN 'Avancé'
                    WHEN us.total_points >= 20 THEN 'Intermédiaire'
                    WHEN us.total_points >= 10 THEN 'Apprenti'
                    ELSE 'Débutant'
                END as skill_level,
                CASE
                    WHEN us.games_played > 0 THEN ROUND((us.games_won / us.games_played) * 100, 1)
                    ELSE 0
                END as success_rate,
                CASE
                    WHEN us.games_played > 0 THEN ROUND(us.total_brand_guesses / us.games_played, 1)
                    ELSE 0
                END as average_attempts,
                COALESCE(
                    (
                        SELECT AVG(duration_seconds)
                        FROM game_sessions gs
                        WHERE gs.user_id = us.user_id
                            AND gs.completed = TRUE
                            AND gs.duration_seconds IS NOT NULL
                    ),
                    0
                ) as average_time_seconds
            FROM user_scores us
            WHERE us.total_points > 0
        `);
        console.log('✅ Vue leaderboard_view créée (corrigée pour total_points)');

        console.log('\n🎉 Migration terminée avec succès!');
        console.log('\n📊 Tables créées avec support multi-serveur:');
        console.log('- brands (avec country)');
        console.log('- models');
        console.log('- user_scores (avec guild_id + index optimisés)');
        console.log('- user_cars_found (avec guild_id)');
        console.log('- game_sessions (avec guild_id)');
        console.log('- leaderboard_view (vue corrigée)');

        console.log('\n🎯 Fonctionnalités activées:');
        console.log('- ✅ Classements par serveur Discord');
        console.log('- ✅ Collection de voitures par serveur');
        console.log('- ✅ Nouveau système de points avec bonus');
        console.log('- ✅ Index optimisés pour les performances');

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