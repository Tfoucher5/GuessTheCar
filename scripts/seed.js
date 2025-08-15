#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { initializeDatabase, executeQuery, closeDatabase } = require('../src/shared/database/connection');

async function seedDatabase() {
    console.log('🌱 Initialisation des données de base...\n');

    try {
        await initializeDatabase();
        console.log('✅ Connexion établie');

        // Vérifier si des données existent déjà
        const [makeCount] = await executeQuery('SELECT COUNT(*) as count FROM marques');
        const [modelCount] = await executeQuery('SELECT COUNT(*) as count FROM modeles');

        if (makeCount.count > 0 || modelCount.count > 0) {
            console.log(`ℹ️  Données existantes trouvées: ${makeCount.count} marques, ${modelCount.count} modèles`);

            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                readline.question('Voulez-vous réinitialiser les données? (y/N): ', resolve);
            });
            readline.close();

            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                console.log('⏹️  Seeding annulé');
                return;
            }

            // Nettoyer les données existantes
            await executeQuery('DELETE FROM modeles');
            await executeQuery('DELETE FROM marques');
            await executeQuery('ALTER TABLE marques AUTO_INCREMENT = 1');
            await executeQuery('ALTER TABLE modeles AUTO_INCREMENT = 1');
            console.log('🗑️  Données existantes supprimées');
        }

        // Lire et exécuter le fichier de données
        const dataPath = path.join(process.cwd(), 'database', 'data.sql');

        try {
            const dataContent = await fs.readFile(dataPath, 'utf8');

            // Diviser en requêtes et exécuter
            const queries = dataContent
                .split(';')
                .map(query => query.trim())
                .filter(query => query.length > 0 && !query.startsWith('--'));

            console.log(`📥 Exécution de ${queries.length} requêtes...`);

            let executedCount = 0;
            for (const query of queries) {
                if (query.trim()) {
                    await executeQuery(query);
                    executedCount++;

                    if (executedCount % 50 === 0) {
                        console.log(`⏳ ${executedCount}/${queries.length} requêtes exécutées...`);
                    }
                }
            }

            console.log('✅ Données importées avec succès');

        } catch (error) {
            console.error('❌ Erreur lors de l\'import des données:', error.message);
            throw error;
        }

        // Vérifier les données importées
        const [finalMakeCount] = await executeQuery('SELECT COUNT(*) as count FROM marques');
        const [finalModelCount] = await executeQuery('SELECT COUNT(*) as count FROM modeles');

        console.log('\n📊 Données importées:');
        console.log(`   🏭 Marques: ${finalMakeCount.count}`);
        console.log(`   🚗 Modèles: ${finalModelCount.count}`);

        // Afficher quelques statistiques
        const [difficultyStats] = await executeQuery(`
            SELECT 
                difficulte,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM modeles), 1) as percentage
            FROM modeles 
            GROUP BY difficulte 
            ORDER BY difficulte
        `);

        console.log('\n📈 Répartition par difficulté:');
        const difficultyNames = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' };
        difficultyStats.forEach(stat => {
            console.log(`   ${difficultyNames[stat.difficulte]}: ${stat.count} (${stat.percentage}%)`);
        });

        const [countryStats] = await executeQuery(`
            SELECT pays, COUNT(*) as count 
            FROM marques 
            GROUP BY pays 
            ORDER BY count DESC 
            LIMIT 10
        `);

        console.log('\n🌍 Top 10 pays:');
        countryStats.forEach(stat => {
            console.log(`   ${stat.pays}: ${stat.count} marques`);
        });

        console.log('\n🎉 Seeding terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur durant le seeding:', error.message);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;