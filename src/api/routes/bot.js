// src/api/routes/bot.js
// Route API corrigée pour gérer correctement les jeux actifs

const express = require('express');
const router = express.Router();
const logger = require('../../shared/utils/logger');

// Tracker en mémoire amélioré
let gameStats = {
    active: 0,
    total: 0,
    completed: 0,
    abandoned: 0,
    todayStarted: 0,
    todayCompleted: 0,
    todayAbandoned: 0,
    activeSessions: new Map(), // Pour tracker les sessions actives par ID
    lastReset: new Date().toDateString()
};

// Reset quotidien des stats
function resetDailyStats() {
    const today = new Date().toDateString();
    if (gameStats.lastReset !== today) {
        gameStats.todayStarted = 0;
        gameStats.todayCompleted = 0;
        gameStats.todayAbandoned = 0;
        gameStats.lastReset = today;
        logger.info('📅 Stats quotidiennes reset');
    }
}

console.log('✅ bot.js routes loaded');

// POST /api/bot/command - Log des commandes
router.post('/command', (req, res) => {
    try {
        const { command, user, timestamp } = req.body;

        logger.debug('Command logged via API:', {
            command,
            user,
            timestamp
        });

        res.json({
            success: true,
            message: 'Command logged',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error logging command:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log command'
        });
    }
});

router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// POST /api/bot/game - ROUTE CORRIGÉE pour gérer les jeux actifs
router.post('/game', (req, res) => {
    try {
        const { action, channelId, user, timestamp, sessionId, gameData } = req.body;

        console.log('🎮 Action reçue:', action, '| Type:', typeof action, '| User:', user, '| SessionID:', sessionId);

        if (!action || !channelId || !user) {
            return res.status(400).json({
                success: false,
                error: 'Paramètres manquants (action, channelId, user requis)'
            });
        }

        resetDailyStats(); // Vérifier si on doit reset les stats du jour

        // Créer un ID de session unique si pas fourni
        const gameSessionId = sessionId || `${channelId}_${user}_${Date.now()}`;
        const now = new Date().toISOString();

        logger.debug('Game action logged via API:', {
            action,
            channelId,
            user,
            sessionId: gameSessionId,
            timestamp
        });

        switch (action.toLowerCase()) {
            case 'start':
                // Démarrer une nouvelle partie
                gameStats.active++;
                gameStats.total++;
                gameStats.todayStarted++;

                // Enregistrer la session active
                gameStats.activeSessions.set(gameSessionId, {
                    channelId,
                    user,
                    startTime: now,
                    status: 'active',
                    ...gameData
                });

                logger.info(`🎮 Game started | Channel: ${channelId} | User: ${user} | SessionID: ${gameSessionId} | Active games: ${gameStats.active}`);
                break;

            case 'complete':
            case 'finish':
            case 'end':
                // Terminer une partie avec succès
                if (gameStats.activeSessions.has(gameSessionId)) {
                    const session = gameStats.activeSessions.get(gameSessionId);
                    const duration = new Date() - new Date(session.startTime);

                    gameStats.active = Math.max(0, gameStats.active - 1);
                    gameStats.completed++;
                    gameStats.todayCompleted++;

                    // Supprimer de la liste des sessions actives
                    gameStats.activeSessions.delete(gameSessionId);

                    logger.info(`✅ Game completed | Channel: ${channelId} | User: ${user} | SessionID: ${gameSessionId} | Duration: ${Math.round(duration / 1000)}s | Active games: ${gameStats.active}`);
                } else {
                    // Si la session n'est pas trouvée, décrémenter quand même
                    gameStats.active = Math.max(0, gameStats.active - 1);
                    gameStats.completed++;
                    gameStats.todayCompleted++;

                    logger.warn(`⚠️ Game completed but session not found | Channel: ${channelId} | User: ${user} | SessionID: ${gameSessionId} | Active games: ${gameStats.active}`);
                }
                break;

            case 'abandon':
            case 'quit':
            case 'stop':
                // Abandonner une partie
                if (gameStats.activeSessions.has(gameSessionId)) {
                    gameStats.activeSessions.delete(gameSessionId);
                }

                gameStats.active = Math.max(0, gameStats.active - 1);
                gameStats.abandoned++;
                gameStats.todayAbandoned++;

                logger.info(`❌ Game abandoned | Channel: ${channelId} | User: ${user} | SessionID: ${gameSessionId} | Active games: ${gameStats.active}`);
                break;

            case 'timeout':
                // Partie expirée par timeout
                if (gameStats.activeSessions.has(gameSessionId)) {
                    gameStats.activeSessions.delete(gameSessionId);
                }

                gameStats.active = Math.max(0, gameStats.active - 1);
                gameStats.abandoned++; // Compter comme abandonnée
                gameStats.todayAbandoned++;

                logger.info(`⏰ Game timeout | Channel: ${channelId} | User: ${user} | SessionID: ${gameSessionId} | Active games: ${gameStats.active}`);
                break;

            default:
                logger.warn(`❓ Action inconnue reçue: ${action} | Channel: ${channelId} | User: ${user} | SessionID: ${gameSessionId}`);
                return res.status(400).json({
                    success: false,
                    error: `Action inconnue: ${action}. Actions supportées: start, complete, abandon, timeout`
                });
        }

        // Nettoyer les sessions expirées (plus de 1 heure)
        cleanExpiredSessions();

        res.json({
            success: true,
            message: `Game ${action} logged`,
            sessionId: gameSessionId,
            stats: {
                active: gameStats.active,
                total: gameStats.total,
                completed: gameStats.completed,
                abandoned: gameStats.abandoned,
                todayStarted: gameStats.todayStarted,
                todayCompleted: gameStats.todayCompleted,
                todayAbandoned: gameStats.todayAbandoned,
                activeSessions: gameStats.activeSessions.size
            },
            timestamp: now
        });
    } catch (error) {
        logger.error('Error logging game action:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log game action',
            details: error.message
        });
    }
});

// Fonction pour nettoyer les sessions expirées
function cleanExpiredSessions() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [sessionId, session] of gameStats.activeSessions.entries()) {
        if (new Date(session.startTime) < oneHourAgo) {
            gameStats.activeSessions.delete(sessionId);
            gameStats.active = Math.max(0, gameStats.active - 1);
            cleanedCount++;
            logger.info(`🧹 Session expirée nettoyée: ${sessionId} | Active games: ${gameStats.active}`);
        }
    }

    if (cleanedCount > 0) {
        logger.info(`🧹 ${cleanedCount} sessions expirées nettoyées`);
    }
}

// GET /api/bot/stats - Statistiques internes pour le bot
router.get('/stats', (req, res) => {
    try {
        resetDailyStats();
        cleanExpiredSessions(); // Nettoyer avant de retourner les stats

        res.json({
            success: true,
            games: {
                active: gameStats.active,
                total: gameStats.total,
                completed: gameStats.completed,
                abandoned: gameStats.abandoned,
                today: {
                    started: gameStats.todayStarted,
                    completed: gameStats.todayCompleted,
                    abandoned: gameStats.todayAbandoned
                },
                activeSessions: Array.from(gameStats.activeSessions.entries()).map(([id, session]) => ({
                    id,
                    ...session,
                    duration: Math.round((new Date() - new Date(session.startTime)) / 1000)
                }))
            },
            lastReset: gameStats.lastReset,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error getting bot stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get stats'
        });
    }
});

// GET /api/bot/sessions - Voir les sessions actives
router.get('/sessions', (req, res) => {
    try {
        cleanExpiredSessions();

        const sessions = Array.from(gameStats.activeSessions.entries()).map(([id, session]) => ({
            sessionId: id,
            channelId: session.channelId,
            user: session.user,
            startTime: session.startTime,
            duration: Math.round((new Date() - new Date(session.startTime)) / 1000),
            status: session.status
        }));

        res.json({
            success: true,
            activeSessions: sessions,
            count: sessions.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error getting active sessions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get active sessions'
        });
    }
});

// POST /api/bot/reset - Reset des stats (pour debug)
router.post('/reset', (req, res) => {
    try {
        const { type } = req.body;

        switch (type) {
            case 'all':
                gameStats = {
                    active: 0,
                    total: 0,
                    completed: 0,
                    abandoned: 0,
                    todayStarted: 0,
                    todayCompleted: 0,
                    todayAbandoned: 0,
                    activeSessions: new Map(),
                    lastReset: new Date().toDateString()
                };
                break;

            case 'active':
                gameStats.active = 0;
                gameStats.activeSessions.clear();
                break;

            case 'daily':
                gameStats.todayStarted = 0;
                gameStats.todayCompleted = 0;
                gameStats.todayAbandoned = 0;
                gameStats.lastReset = new Date().toDateString();
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Type invalide. Utilisez: all, active, ou daily'
                });
        }

        logger.info(`Bot stats reset via API: ${type || 'all'}`);

        res.json({
            success: true,
            message: `Stats reset: ${type || 'all'}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error resetting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset stats'
        });
    }
});

// Nettoyer les sessions expirées toutes les 10 minutes
setInterval(cleanExpiredSessions, 10 * 60 * 1000);

module.exports = router;