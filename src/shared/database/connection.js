// src/shared/database/connection.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

console.log('🔧 Initializing Supabase connection...');

// Vérifier que les variables d'environnement sont définies
if (!process.env.SUPABASE_URL) {
    logger.error('❌ SUPABASE_URL manquant dans .env');
    throw new Error('SUPABASE_URL manquant dans les variables d\'environnement');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
    logger.error('❌ SUPABASE_SERVICE_KEY manquant dans .env');
    throw new Error('SUPABASE_SERVICE_KEY manquant dans les variables d\'environnement');
}

logger.info('Environment variables loaded:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Défini' : '❌ Manquant',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✅ Défini' : '❌ Manquant'
});

// Créer le client Supabase avec la clé de service pour bypass les RLS
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

logger.info('✅ Supabase client created');

// Fonction de test de connexion
async function testConnection() {
    try {
        logger.info('🔍 Testing Supabase connection...');

        const { count, error } = await supabase
            .from('user_scores')
            .select('*', { count: 'exact', head: true });

        if (error) {
            logger.error('❌ Connection test failed:', error);
            throw error;
        }

        logger.info('✅ Supabase connection successful');
        return true;
    } catch (error) {
        logger.error('❌ Supabase connection error:', {
            message: error.message,
            code: error.code,
            details: error.details
        });
        throw error;
    }
}

// Fonction pour initialiser la base de données (compatibilité avec l'ancien code)
async function initializeDatabase() {
    await testConnection();
    return supabase;
}

// Fonction pour fermer la connexion (pour compatibilité)
async function closeDatabase() {
    logger.info('ℹ️ Supabase uses connection pooling, no need to close');
}

// Export du client et des fonctions
module.exports = {
    supabase,
    testConnection,
    initializeDatabase,
    closeDatabase
};
