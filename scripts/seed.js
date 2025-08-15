#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function seedDatabase() {
    console.log('🌱 Initialisation des données depuis data.sql...\n');

    // Configuration simple
    const connectionConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'guessthecar',
        multipleStatements: true
    };

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        connectionConfig.password = process.env.DB_PASSWORD;
    }

    console.log('📡 Connexion à la base de données...');
    const connection = await mysql.createConnection(connectionConfig);

    try {
        console.log('📂 Lecture du fichier data.sql...');
        const dataPath = path.join(process.cwd(), 'database', 'data.sql');
        let dataContent = await fs.readFile(dataPath, 'utf8');

        console.log(`✅ Fichier lu: ${dataContent.length} caractères`);

        console.log('🔧 Traitement du SQL...');

        // Exécuter directement le fichier SQL complet
        // Diviser uniquement sur les vrais points-virgules de fin d'instruction
        const statements = dataContent
            .split('\n')
            .filter(line => line.trim() && !line.trim().startsWith('--'))
            .join(' ')
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`📋 ${statements.length} instructions SQL trouvées`);

        console.log('⚡ Exécution des instructions...');
        let successCount = 0;
        let errorCount = 0;

        for (const [index, statement] of statements.entries()) {
            try {
                if (statement.trim()) {
                    await connection.execute(statement);
                    successCount++;

                    // Afficher le progrès
                    if (index % 10 === 0) {
                        console.log(`⏳ ${index + 1}/${statements.length} instructions exécutées...`);
                    }

                    // Messages spéciaux pour les grandes opérations
                    if (statement.toUpperCase().includes('DELETE FROM MODELS')) {
                        console.log('🗑️  Modèles supprimés');
                    } else if (statement.toUpperCase().includes('DELETE FROM BRANDS')) {
                        console.log('🗑️  Marques supprimées');
                    } else if (statement.toUpperCase().includes('INSERT INTO BRANDS')) {
                        console.log('🏭 Insertion des marques...');
                    } else if (statement.toUpperCase().includes('INSERT INTO MODELS')) {
                        console.log('🚗 Insertion des modèles...');
                    }
                }
            } catch (error) {
                errorCount++;
                console.error(`❌ Erreur instruction ${index + 1}:`, error.message);

                if (statement.length < 200) {
                    console.error(`   SQL: ${statement}`);
                }
            }
        }

        console.log(`\n📊 Exécution terminée: ${successCount} succès, ${errorCount} erreurs`);

        // Ajouter un utilisateur de test
        console.log('\n👤 Ajout d\'un utilisateur de test...');
        try {
            await connection.execute(
                `INSERT IGNORE INTO user_scores (
                    user_id, username, total_points, total_difficulty_points,
                    games_played, games_won, correct_brand_guesses, correct_model_guesses,
                    total_brand_guesses, total_model_guesses, best_streak, current_streak
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['123456789012345678', 'TestUser', 150, 200, 10, 7, 15, 8, 20, 15, 5, 2]
            );
            console.log('✅ Utilisateur de test ajouté');
        } catch (error) {
            console.log('ℹ️  Erreur utilisateur test:', error.message);
        }

        // Vérification finale et statistiques
        console.log('\n📊 Vérification finale...');

        const [brandCount] = await connection.execute('SELECT COUNT(*) as count FROM brands');
        const [modelCount] = await connection.execute('SELECT COUNT(*) as count FROM models');
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM user_scores');

        console.log(`\n🎯 Résultats finaux:`);
        console.log(`- ${brandCount[0].count} marques`);
        console.log(`- ${modelCount[0].count} modèles`);
        console.log(`- ${userCount[0].count} utilisateurs`);

        if (brandCount[0].count === 0) {
            console.log('\n❌ PROBLÈME: Aucune marque insérée !');
            console.log('💡 Solutions possibles:');
            console.log('1. Vérifier que database/data.sql existe');
            console.log('2. Vérifier que les noms de tables correspondent (brands/models)');
            console.log('3. Vérifier les permissions MySQL');

            // Debug: afficher les premières lignes du fichier
            const debugLines = dataContent.split('\n').slice(0, 20);
            console.log('\n🔍 Premières lignes du fichier:');
            debugLines.forEach((line, i) => {
                if (line.trim()) {
                    console.log(`${i + 1}: ${line.substring(0, 100)}...`);
                }
            });

        } else {
            // Statistiques détaillées
            try {
                console.log('\n🎮 Répartition par difficulté:');
                const [diffStats] = await connection.execute(`
                    SELECT difficulty_level, COUNT(*) as count 
                    FROM models 
                    WHERE difficulty_level IS NOT NULL
                    GROUP BY difficulty_level 
                    ORDER BY difficulty_level
                `);

                diffStats.forEach(stat => {
                    const level = stat.difficulty_level === 1 ? 'Facile' :
                        stat.difficulty_level === 2 ? 'Moyen' : 'Difficile';
                    console.log(`  - ${level}: ${stat.count} modèles`);
                });

                // Exemples de marques
                const [sampleBrands] = await connection.execute('SELECT name FROM brands ORDER BY name LIMIT 10');
                console.log('\n🏭 Exemples de marques:');
                sampleBrands.forEach(brand => console.log(`  - ${brand.name}`));

                // Exemples de modèles
                const [sampleModels] = await connection.execute(`
                    SELECT m.name, b.name as brand_name, m.difficulty_level
                    FROM models m 
                    JOIN brands b ON m.brand_id = b.id 
                    ORDER BY m.difficulty_level, b.name
                    LIMIT 10
                `);
                console.log('\n🚗 Exemples de modèles:');
                sampleModels.forEach(model => {
                    console.log(`  - ${model.brand_name} ${model.name} (difficulté ${model.difficulty_level})`);
                });

            } catch (error) {
                console.log('ℹ️  Impossible d\'afficher les statistiques détaillées');
            }

            console.log('\n🎉 Base de données initialisée avec succès!');
            console.log('🚀 Ton bot est prêt à être testé avec npm run dev');
        }

    } catch (error) {
        console.error('❌ Erreur fatale:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    seedDatabase().catch(console.error);
}

module.exports = seedDatabase;