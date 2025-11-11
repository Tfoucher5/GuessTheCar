require('dotenv').config();
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
 * Gestion de l'arrêt propre de l'application
 */
function setupGracefulShutdown() {
    const gracefulShutdown = async(signal) => {
        logger.info(`📴 Received ${signal}, shutting down gracefully...`);

        try {
            // Logger les stats finales avant l'arrêt
            const gameEngine = getGameEngineInstance();
            if (gameEngine) {
                const activeGames = gameEngine.getAllActiveGames();
                logger.info('📋 Final stats before shutdown:', {
                    activeGames: activeGames.length,
                    uptime: Math.round(process.uptime() / 60) + ' minutes'
                });
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
