// src/shared/utils/supabaseCommandLogger.js

const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

// Initialiser le client Supabase
function initSupabase() {
    if (!supabaseUrl || !supabaseKey) {
        logger.warn('⚠️ Supabase credentials not configured. Command logging will be disabled.');
        return null;
    }

    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        logger.info('✅ Supabase client initialized for command logging');
        return supabase;
    } catch (error) {
        logger.error('❌ Failed to initialize Supabase client:', error);
        return null;
    }
}

/**
 * Log une commande dans Supabase
 * @param {string} commandName - Nom de la commande (sans le /)
 * @param {string} userId - ID Discord de l'utilisateur
 * @param {string|null} guildId - ID du serveur Discord (null pour DM)
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
async function logCommand(commandName, userId, guildId = null) {
    // Initialiser Supabase si ce n'est pas déjà fait
    if (!supabase) {
        supabase = initSupabase();
    }

    // Si Supabase n'est pas disponible, on skip silencieusement
    if (!supabase) {
        return false;
    }

    try {
        // ✅ CORRECTION : Utiliser les noms avec tirets comme dans ta table
        const { data, error } = await supabase
            .from('command_log')
            .insert([
                {
                    'user-id': userId,        // ← Avec tiret
                    'command_name': commandName,
                    'guild-id': guildId       // ← Avec tiret
                }
            ]);

        if (error) {
            logger.error('❌ Error logging command to Supabase:', {
                error: error.message,
                commandName,
                userId,
                guildId
            });
            return false;
        }

        logger.info('✅ Command logged to Supabase:', {
            commandName,
            userId,
            guildId
        });

        return true;

    } catch (error) {
        logger.error('❌ Exception while logging command to Supabase:', {
            error: error.message,
            commandName,
            userId,
            guildId
        });
        return false;
    }
}

/**
 * Récupère les statistiques de commandes depuis Supabase
 * @param {number} days - Nombre de jours à analyser (défaut: 30)
 * @returns {Promise<Object|null>} - Statistiques ou null en cas d'erreur
 */
async function getCommandStats(days = 30) {
    if (!supabase) {
        supabase = initSupabase();
    }

    if (!supabase) {
        return null;
    }

    try {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const { data, error } = await supabase
            .from('command_log')
            .select('command_name, created_at, "user-id"')  // ✅ Avec tiret
            .gte('created_at', dateFrom.toISOString());

        if (error) {
            logger.error('Error fetching command stats from Supabase:', error);
            return null;
        }

        // Calculer les statistiques
        const stats = {
            total: data.length,
            byCommand: {},
            today: 0,
            thisWeek: 0,
            uniqueUsers: []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        data.forEach(log => {
            // Par commande
            if (!stats.byCommand[log.command_name]) {
                stats.byCommand[log.command_name] = 0;
            }
            stats.byCommand[log.command_name]++;

            // Utilisateurs uniques
            if (log['user-id'] && !stats.uniqueUsers.includes(log['user-id'])) {
                stats.uniqueUsers.push(log['user-id']);
            }

            // Aujourd'hui
            const logDate = new Date(log.created_at);
            if (logDate >= today) {
                stats.today++;
            }

            // Cette semaine
            if (logDate >= weekAgo) {
                stats.thisWeek++;
            }
        });

        // Trier les commandes par popularité
        stats.popular = Object.entries(stats.byCommand)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        return stats;

    } catch (error) {
        logger.error('Exception while fetching command stats:', error);
        return null;
    }
}

/**
 * Récupère le nombre d'utilisateurs uniques ayant utilisé des commandes
 * @param {number} days - Nombre de jours à analyser
 * @returns {Promise<number>} - Nombre d'utilisateurs uniques
 */
async function getUniqueUsers(days = 30) {
    if (!supabase) {
        supabase = initSupabase();
    }

    if (!supabase) {
        return 0;
    }

    try {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const { data, error } = await supabase
            .from('command_log')
            .select('"user-id"')  // ✅ Avec tiret
            .gte('created_at', dateFrom.toISOString());

        if (error) {
            logger.error('Error fetching unique users from Supabase:', error);
            return 0;
        }

        const uniqueUsers = new Set(data.map(log => log['user-id']));
        return uniqueUsers.size;

    } catch (error) {
        logger.error('Exception while fetching unique users:', error);
        return 0;
    }
}

module.exports = {
    logCommand,
    getCommandStats,
    getUniqueUsers,
    initSupabase
};
