#!/usr/bin/env node
/* eslint-disable no-undef */

// scripts/test-player-creation.js
require('dotenv').config();

const { initializeConnection, closeConnection } = require('../src/shared/database/connection');

async function testPlayerCreation() {
    console.log('🧪 Test de création de joueur...\n');

    try {
        // 1. Initialiser la connexion
        console.log('🔌 Initialisation de la connexion...');
        await initializeConnection();
        console.log('✅ Connexion initialisée');

        // 2. Importer les classes après l'init
        const PlayerRepository = require('../src/shared/database/repositories/PlayerRepository');
        const PlayerManager = require('../src/core/player/PlayerManager');
        
        const playerRepository = new PlayerRepository();
        const playerManager = new PlayerManager();
        
        const testUserId = '123456789012345678';
        const testUsername = 'TestPlayer';

        console.log('\n1️⃣ Test PlayerRepository.create()...');
        
        // Supprimer le joueur de test s'il existe
        try {
            const { executeQuery } = require('../src/shared/database/connection');
            await executeQuery('DELETE FROM user_scores WHERE user_id = ?', [testUserId]);
            console.log('🧹 Joueur de test supprimé (s\'il existait)');
        } catch (error) {
            console.log('ℹ️ Pas de joueur de test à supprimer');
        }

        // Test de création directe
        const createdPlayer = await playerRepository.create(testUserId, testUsername);
        console.log('✅ PlayerRepository.create() terminé');
        console.log('📊 Joueur créé:', {
            user_id: createdPlayer.userId,
            username: createdPlayer.username,
            total_points: createdPlayer.totalPoints,
            games_played: createdPlayer.gamesPlayed
        });

        console.log('\n2️⃣ Test PlayerRepository.findByUserId()...');
        const foundPlayer = await playerRepository.findByUserId(testUserId);
        console.log('✅ Joueur trouvé:', foundPlayer ? 'OUI' : 'NON');

        console.log('\n3️⃣ Test PlayerManager.findOrCreatePlayer()...');
        const testUserId2 = '987654321098765432';
        const testUsername2 = 'TestPlayer2';
        
        const managedPlayer = await playerManager.findOrCreatePlayer(testUserId2, testUsername2);
        console.log('✅ PlayerManager.findOrCreatePlayer() terminé');
        console.log('📊 Joueur géré:', {
            user_id: managedPlayer.userId,
            username: managedPlayer.username,
            total_points: managedPlayer.totalPoints
        });

        console.log('\n4️⃣ Test updatePlayerScore()...');
        const updatedPlayer = await playerManager.updatePlayerScore(
            testUserId2,
            testUsername2,
            10,  // basePoints
            5,   // difficultyPoints  
            true, // isComplete
            {
                carId: 1,
                duration: 30,
                attemptsMake: 2,
                attemptsModel: 1,
                makeFound: true,
                modelFound: true
            }
        );
        
        console.log('✅ updatePlayerScore terminé');
        console.log('📊 Statistiques après partie:', {
            username: updatedPlayer.username,
            totalPoints: updatedPlayer.totalPoints,
            totalDifficultyPoints: updatedPlayer.totalDifficultyPoints,
            gamesPlayed: updatedPlayer.gamesPlayed,
            gamesWon: updatedPlayer.gamesWon
        });

        console.log('\n5️⃣ Vérification finale en base...');
        const { executeQuery } = require('../src/shared/database/connection');
        
        const allTestPlayers = await executeQuery(
            'SELECT * FROM user_scores WHERE user_id IN (?, ?)',
            [testUserId, testUserId2]
        );

        console.log(`📊 ${allTestPlayers.length} joueur(s) de test trouvé(s) en base:`);
        
        allTestPlayers.forEach((player, index) => {
            console.log(`   ${index + 1}. ${player.username} (${player.user_id})`);
            console.log(`      - Points: ${player.total_points}`);
            console.log(`      - Points difficulté: ${player.total_difficulty_points}`);
            console.log(`      - Parties: ${player.games_played}`);
            console.log(`      - Victoires: ${player.games_won}`);
        });

        console.log('\n6️⃣ Test des sessions de jeu...');
        const gameSessions = await executeQuery(
            'SELECT * FROM game_sessions WHERE user_id IN (?, ?)',
            [testUserId, testUserId2]
        );
        
        console.log(`📊 ${gameSessions.length} session(s) de jeu trouvée(s):`);
        gameSessions.forEach((session, index) => {
            console.log(`   ${index + 1}. Session ${session.id}`);
            console.log(`      - Joueur: ${session.user_id}`);
            console.log(`      - Complétée: ${session.completed ? 'OUI' : 'NON'}`);
            console.log(`      - Points: ${session.points_earned}`);
            console.log(`      - Durée: ${session.duration_seconds}s`);
        });

        console.log('\n✅ Tous les tests terminés avec succès !');
        
        // Nettoyage
        console.log('\n🧹 Nettoyage des données de test...');
        await executeQuery('DELETE FROM game_sessions WHERE user_id IN (?, ?)', [testUserId, testUserId2]);
        await executeQuery('DELETE FROM user_scores WHERE user_id IN (?, ?)', [testUserId, testUserId2]);
        console.log('✅ Données de test supprimées');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        console.error('📋 Détails:', {
            message: error.message,
            code: error.code,
            errno: error.errno
        });
        
        if (error.sql) {
            console.error('🔍 Requête SQL:', error.sql);
        }
        
        if (error.stack) {
            console.error('📚 Stack trace:', error.stack);
        }
    } finally {
        // Fermer la connexion
        await closeConnection();
        console.log('🔌 Connexion fermée');
    }
}

if (require.main === module) {
    testPlayerCreation().catch(console.error);
}

module.exports = testPlayerCreation;