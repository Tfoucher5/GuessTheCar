#!/usr/bin/env node

require('dotenv').config();

// Initialiser la connexion d'abord
const { initializeConnection, closeConnection } = require('../src/shared/database/connection');

async function testSaveScore() {
    console.log('🧪 Test de sauvegarde des scores...\n');

    try {
        // 1. Initialiser la connexion
        console.log('🔌 Initialisation de la connexion...');
        await initializeConnection();
        console.log('✅ Connexion initialisée');

        // 2. Importer les classes après l'init
        const PlayerManager = require('../src/core/player/PlayerManager');
        
        const playerManager = new PlayerManager();
        const userId = '573543227525824516';
        const username = 't3sk0';

        console.log('\n1️⃣ Test updatePlayerScore...');
        
        const result = await playerManager.updatePlayerScore(
            userId,
            username,
            10,  // basePoints
            2,   // difficultyPoints  
            true // isComplete
        );

        console.log('✅ updatePlayerScore terminé');
        console.log('📊 Résultat:', {
            username: result.username,
            totalPoints: result.totalDifficultyPoints,
            gamesPlayed: result.gamesPlayed
        });

        // 3. Vérifier en base directement
        console.log('\n2️⃣ Vérification en base...');
        const { executeQuery } = require('../src/shared/database/connection');
        
        const rows = await executeQuery(
            'SELECT * FROM user_scores WHERE user_id = ?',
            [userId]
        );

        if (rows.length > 0) {
            const user = rows[0];
            console.log('📊 Données en base après test:');
            console.log(`- Points: ${user.total_difficulty_points}`);
            console.log(`- Parties: ${user.games_played}`);
            console.log(`- Gagnées: ${user.games_won}`);
        } else {
            console.log('❌ Utilisateur non trouvé en base');
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        // 4. Fermer la connexion
        await closeConnection();
    }
}

if (require.main === module) {
    testSaveScore().catch(console.error);
}

module.exports = testSaveScore;