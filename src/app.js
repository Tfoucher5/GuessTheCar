require('dotenv').config();
const statsHelper = require('./shared/utils/StatsHelper');
const logger = require('./shared/utils/logger');

let gameEngineInstance = null;
let discordClient = null;

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

async function startApplication() {
    try {
        logger.info('🚀 Starting Guess The Car Bot Application...');

        // Initialiser la base de données
        const { initializeDatabase } = require('./shared/database/connection');
        await initializeDatabase();
        logger.info('✅ Database connected');

        // Démarrer l'API REST
        const apiServer = require('./api/server');
        const API_PORT = process.env.API_PORT || 3000;
        apiServer.listen(API_PORT, () => {
            logger.info(`✅ API Server running on port ${API_PORT}`);
        });

        // Démarrer le bot Discord
        const discordClient = require('./bot/client');
        await discordClient.login(process.env.DISCORD_TOKEN);
        logger.info('✅ Discord Bot connected');

        // === NOUVEAU : Récupérer l'instance du GameEngine après le démarrage du bot ===
        await waitForGameEngine();

        // === NOUVEAU : Démarrer la synchronisation automatique ===
        startStatsSync();

        // === NOUVEAU : Gérer l'arrêt propre ===
        setupGracefulShutdown();

        logger.info('🎉 Application started successfully!');

    } catch (error) {
        logger.error('❌ Failed to start application:', error);
        process.exit(1);
    }
}

async function waitForGameEngine() {
    return new Promise((resolve) => {
        const checkGameEngine = () => {
            try {
                // Méthode 1 : Récupérer depuis messageCreate.js
                const messageCreateModule = require('./bot/events/messageCreate');
                if (messageCreateModule.gameEngine) {
                    gameEngineInstance = messageCreateModule.gameEngine;
                    logger.info('✅ GameEngine instance found from messageCreate module');
                    resolve();
                    return;
                }

                // Méthode 2 : Créer une nouvelle instance si nécessaire
                if (!gameEngineInstance) {
                    const GameEngine = require('./core/game/GameEngine');
                    gameEngineInstance = new GameEngine();
                    logger.info('✅ New GameEngine instance created');
                    resolve();
                    return;
                }

                // Retry dans 1 seconde si pas trouvé
                setTimeout(checkGameEngine, 1000);

            } catch (error) {
                logger.warn('GameEngine not yet available, retrying...', error.message);
                setTimeout(checkGameEngine, 1000);
            }
        };

        checkGameEngine();
    });
}

/**
 * Fonction pour obtenir l'instance du GameEngine
 */
function getGameEngineInstance() {
    // Méthode 1 : Utiliser l'instance stockée
    if (gameEngineInstance) {
        return gameEngineInstance;
    }

    // Méthode 2 : Essayer de récupérer depuis messageCreate.js
    try {
        const messageCreateModule = require('./bot/events/messageCreate');
        if (messageCreateModule.gameEngine) {
            gameEngineInstance = messageCreateModule.gameEngine;
            return gameEngineInstance;
        }
    } catch (error) {
        logger.debug('Could not get GameEngine from messageCreate:', error.message);
    }

    // Méthode 3 : Créer une nouvelle instance (fallback)
    try {
        const GameEngine = require('./core/game/GameEngine');
        gameEngineInstance = new GameEngine();
        logger.warn('Created fallback GameEngine instance');
        return gameEngineInstance;
    } catch (error) {
        logger.error('Could not create GameEngine instance:', error.message);
        return null;
    }
}

/**
 * Test de connexion à l'API Stats au démarrage
 */
async function testStatsConnection() {
    try {
        logger.info('🔍 Testing stats API connection...');

        const result = await statsHelper.testConnection();

        if (result.success) {
            logger.info('✅ Stats API connected successfully');
        } else {
            logger.warn('⚠️ Stats API not available:', result.reason || result.error);
            logger.info('📊 Bot will continue without stats tracking');
        }
    } catch (error) {
        logger.warn('⚠️ Stats API connection failed:', error.message);
    }
}

/**
 * Démarre la synchronisation automatique des stats
 */
function startStatsSync() {
    // Synchronisation toutes les 5 minutes
    const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const statsInterval = setInterval(async() => {
        try {
            await syncGameEngineStats();
        } catch (error) {
            logger.error('Error in stats sync:', error.message);
        }
    }, SYNC_INTERVAL);

    // Stocker l'interval pour pouvoir l'arrêter
    global.statsInterval = statsInterval;

    logger.info('📊 Stats synchronization started (every 5 minutes)');

    // Première sync après 30 secondes
    setTimeout(async() => {
        try {
            await syncGameEngineStats();
        } catch (error) {
            logger.error('Error in initial stats sync:', error.message);
        }
    }, 30000);
}

/**
 * Synchronise les stats du GameEngine avec l'API
 */
async function syncGameEngineStats() {
    try {
        const gameEngine = getGameEngineInstance();

        if (!gameEngine) {
            logger.debug('GameEngine not available for stats sync');
            return;
        }

        // Obtenir les stats du GameEngine
        const engineStats = gameEngine.getEngineStats();
        const activeGames = gameEngine.getAllActiveGames();

        // Obtenir les stats actuelles de l'API
        const apiStats = await statsHelper.getStats();

        if (apiStats) {
            const apiActiveCount = apiStats.games?.active || 0;
            const engineActiveCount = activeGames.length;

            // Logger les stats périodiquement
            logger.debug('Stats sync completed:', {
                activeGames: engineActiveCount,
                apiActiveGames: apiActiveCount,
                averageAttempts: Math.round(engineStats.averageAttempts * 10) / 10,
                averageTimeSpent: Math.round(engineStats.averageTimeSpent / 1000) + 's'
            });

            // Si les comptes ne correspondent pas trop, logger un warning
            if (Math.abs(apiActiveCount - engineActiveCount) > 2) {
                logger.warn('Active games count mismatch:', {
                    api: apiActiveCount,
                    engine: engineActiveCount,
                    difference: Math.abs(apiActiveCount - engineActiveCount)
                });
            }
        }

    } catch (error) {
        logger.error('Error syncing GameEngine stats:', error.message);
    }
}

/**
 * Gestion de l'arrêt propre de l'application
 */
function setupGracefulShutdown() {
    const gracefulShutdown = async(signal) => {
        logger.info(`📴 Received ${signal}, shutting down gracefully...`);

        try {
            // Arrêter la synchronisation des stats
            if (global.statsInterval) {
                clearInterval(global.statsInterval);
                logger.info('📊 Stats synchronization stopped');
            }

            // Envoyer les dernières stats avant l'arrêt
            const gameEngine = getGameEngineInstance();
            if (gameEngine) {
                const activeGames = gameEngine.getAllActiveGames();
                logger.info('📋 Final stats before shutdown:', {
                    activeGames: activeGames.length,
                    uptime: Math.round(process.uptime() / 60) + ' minutes'
                });

                // Marquer toutes les parties actives comme abandonnées
                for (const { threadId } of activeGames) {
                    try {
                        await statsHelper.logGame('abandon', threadId);
                    } catch (error) {
                        // Ignore les erreurs de cleanup
                    }
                }

                if (activeGames.length > 0) {
                    logger.info(`🧹 ${activeGames.length} active games marked as abandoned`);
                }
            }

            // Arrêter le client Discord
            if (discordClient) {
                discordClient.destroy();
                logger.info('🔌 Discord client disconnected');
            }

            logger.info('✅ Graceful shutdown completed');
            process.exit(0);

        } catch (error) {
            logger.error('❌ Error during graceful shutdown:', error.message);
            process.exit(1);
        }
    };

    // Écouter les signaux d'arrêt
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        gracefulShutdown('unhandledRejection');
    });
}

/**
 * Force une synchronisation manuelle des stats (pour debug)
 */
async function forceSyncStats() {
    try {
        logger.info('🔄 Forcing stats synchronization...');
        await syncGameEngineStats();
        logger.info('✅ Manual stats sync completed');
    } catch (error) {
        logger.error('❌ Manual stats sync failed:', error.message);
    }
}

/**
 * Obtenir les stats actuelles (pour monitoring)
 */
async function getCurrentStats() {
    try {
        const gameEngine = getGameEngineInstance();
        const engineStats = gameEngine ? gameEngine.getEngineStats() : null;
        const apiStats = await statsHelper.getStats();

        return {
            engine: engineStats,
            api: apiStats,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        logger.error('Error getting current stats:', error.message);
        return null;
    }
}


// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

startApplication();
