#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function seedDatabase() {
    console.log('🌱 Initialisation des données depuis data.sql...\n');

    // Configuration PostgreSQL avec DATABASE_URL
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('📡 Connexion à Supabase/PostgreSQL...');
    const client = await pool.connect();

    try {
        console.log('📂 Lecture du fichier data.sql...');
        const dataPath = path.join(process.cwd(), 'database', 'data.sql');
        let dataContent = await fs.readFile(dataPath, 'utf8');

        console.log(`✅ Fichier lu: ${dataContent.length} caractères`);

        console.log('🔧 Traitement du SQL...');

        // Adapter le SQL pour PostgreSQL
        // MySQL -> PostgreSQL conversions communes
        dataContent = dataContent
            // Remplacer les backticks MySQL par des guillemets doubles PostgreSQL
            .replace(/`/g, '"')
            // Remplacer AUTO_INCREMENT par SERIAL (si nécessaire)
            .replace(/AUTO_INCREMENT/gi, '')
            // Remplacer les ENGINE=InnoDB par rien
            .replace(/ENGINE=InnoDB/gi, '')
            .replace(/DEFAULT CHARSET=\w+/gi, '');

        // Diviser les instructions SQL
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
                    await client.query(statement);
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

        // Vérification finale et statistiques
        console.log('\n📊 Vérification finale...');

        const brandCount = await client.query('SELECT COUNT(*) as count FROM brands');
        const modelCount = await client.query('SELECT COUNT(*) as count FROM models');
        const userCount = await client.query('SELECT COUNT(*) as count FROM user_scores');

        console.log(`\n🎯 Résultats finaux:`);
        console.log(`- ${brandCount.rows[0].count} marques`);
        console.log(`- ${modelCount.rows[0].count} modèles`);
        console.log(`- ${userCount.rows[0].count} utilisateurs`);

        if (brandCount.rows[0].count === 0) {
            console.log('\n❌ PROBLÈME: Aucune marque insérée !');
            console.log('💡 Solutions possibles:');
            console.log('1. Vérifier que database/data.sql existe');
            console.log('2. Vérifier que les noms de tables correspondent (brands/models)');
            console.log('3. Vérifier les permissions PostgreSQL');
            console.log('4. Vérifier que le SQL est compatible PostgreSQL');

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
                const diffStats = await client.query(`
                    SELECT difficulty_level, COUNT(*) as count 
                    FROM models 
                    WHERE difficulty_level IS NOT NULL
                    GROUP BY difficulty_level 
                    ORDER BY difficulty_level
                `);

                diffStats.rows.forEach(stat => {
                    const level = stat.difficulty_level === 1 ? 'Facile' :
                        stat.difficulty_level === 2 ? 'Moyen' : 'Difficile';
                    console.log(`  - ${level}: ${stat.count} modèles`);
                });

                // Exemples de marques
                const sampleBrands = await client.query('SELECT name FROM brands ORDER BY name LIMIT 10');
                console.log('\n🏭 Exemples de marques:');
                sampleBrands.rows.forEach(brand => console.log(`  - ${brand.name}`));

                // Exemples de modèles
                const sampleModels = await client.query(`
                    SELECT m.name, b.name as brand_name, m.difficulty_level
                    FROM models m 
                    JOIN brands b ON m.brand_id = b.id 
                    ORDER BY m.difficulty_level, b.name
                    LIMIT 10
                `);
                console.log('\n🚗 Exemples de modèles:');
                sampleModels.rows.forEach(model => {
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
        client.release();
        await pool.end();
    }
}

if (require.main === module) {
    seedDatabase().catch(console.error);
}

module.exports = seedDatabase;