#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { initializeDatabase, executeQuery, closeDatabase } = require('../src/shared/database/connection');
const logger = require('../src/shared/utils/logger');

async function runMigrations() {
    console.log('🔄 Exécution des migrations de base de données...\n');

    try {
        // Initialiser la connexion
        await initializeDatabase();
        console.log('✅ Connexion à la base de données établie');

        // Lire et exécuter le schema principal
        const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
        try {
            const schemaContent = await fs.readFile(schemaPath, 'utf8');

            // Diviser le schema en requêtes individuelles
            const queries = schemaContent
                .split(';')
                .map(query => query.trim())
                .filter(query => query.length > 0 && !query.startsWith('--'));

            for (const query of queries) {
                if (query.trim()) {
                    await executeQuery(query);
                }
            }

            console.log('✅ Schema principal appliqué');
        } catch (error) {
            console.error('❌ Erreur lors de l\'application du schema:', error.message);
            throw error;
        }

        // Exécuter les migrations spécifiques
        const migrationsPath = path.join(process.cwd(), 'database', 'migrations');

        try {
            const migrationFiles = await fs.readdir(migrationsPath);
            const sqlFiles = migrationFiles
                .filter(file => file.endsWith('.sql'))
                .sort(); // Exécuter dans l'ordre alphabétique

            for (const file of sqlFiles) {
                try {
                    const migrationPath = path.join(migrationsPath, file);
                    const migrationContent = await fs.readFile(migrationPath, 'utf8');

                    const queries = migrationContent
                        .split(';')
                        .map(query => query.trim())
                        .filter(query => query.length > 0 && !query.startsWith('--'));

                    for (const query of queries) {
                        if (query.trim()) {
                            await executeQuery(query);
                        }
                    }

                    console.log(`✅ Migration appliquée: ${file}`);
                } catch (error) {
                    console.error(`❌ Erreur migration ${file}:`, error.message);
                }
            }

            if (sqlFiles.length === 0) {
                console.log('ℹ️  Aucune migration trouvée dans database/migrations/');
            }

        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('ℹ️  Dossier migrations non trouvé, création...');
                await fs.mkdir(migrationsPath, { recursive: true });
            } else {
                throw error;
            }
        }

        // Migrer les anciennes données si scores.json existe
        await migrateLegacyData();

        console.log('\n🎉 Migrations terminées avec succès!');

    } catch (error) {
        console.error('❌ Erreur durant les migrations:', error.message);
        logger.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

async function migrateLegacyData() {
    try {
        const scoresPath = path.join(process.cwd(), 'scores.json');
        const scoresData = await fs.readFile(scoresPath, 'utf8');
        const legacyScores = JSON.parse(scoresData);

        console.log('\n📦 Migration des anciennes données détectée...');

        let migratedCount = 0;
        let errorCount = 0;

        for (const [userId, userData] of Object.entries(legacyScores)) {
            try {
                // Vérifier si le joueur existe déjà
                const existing = await executeQuery(
                    'SELECT id FROM players WHERE user_id = ?',
                    [userId]
                );

                if (existing.length === 0) {
                    // Créer le nouveau joueur avec les anciennes données
                    await executeQuery(`
                        INSERT INTO players (
                            user_id, username, cars_guessed, partial_guesses, 
                            total_points, total_difficulty_points, total_attempts, 
                            best_time, last_game_time
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        userId,
                        userData.username,
                        userData.carsGuessed || 0,
                        userData.partialGuesses || 0,
                        userData.totalPoints || 0,
                        userData.totalDifficultyPoints || userData.totalPoints || 0,
                        userData.totalAttempts || 0,
                        userData.bestTime || null,
                        userData.lastGameTime || null
                    ]);

                    migratedCount++;
                    console.log(`✅ Migré: ${userData.username}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`❌ Erreur migration ${userData.username}:`, error.message);
            }
        }

        console.log(`\n📊 Migration legacy terminée: ${migratedCount} réussies, ${errorCount} erreurs`);

        if (migratedCount > 0) {
            // Sauvegarder l'ancien fichier
            const backupPath = path.join(process.cwd(), `scores.json.backup.${Date.now()}`);
            await fs.copyFile(scoresPath, backupPath);
            console.log(`💾 Sauvegarde créée: ${path.basename(backupPath)}`);
        }

    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('❌ Erreur migration legacy:', error.message);
        }
        // Fichier scores.json n'existe pas, c'est normal
    }
}

if (require.main === module) {
    runMigrations();
}

module.exports = runMigrations;