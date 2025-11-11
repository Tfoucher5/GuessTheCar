require('dotenv').config();
const logger = require('./shared/utils/logger');
const GameEngineManager = require('./core/game/GameEngineManager');

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

        // Initialiser le GameEngine
        GameEngineManager.initialize();

        // Démarrer le bot Discord
        const discordClient = require('./bot/client');
        await discordClient.login(process.env.DISCORD_TOKEN);
        logger.info('✅ Discord Bot connected');

        // Gérer l'arrêt propre
        setupGracefulShutdown();

        logger.info('🎉 Application started successfully!');

    } catch (error) {
        logger.error('❌ Failed to start application:', error);
        process.exit(1);
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
            if (GameEngineManager.isInitialized()) {
                const gameEngine = GameEngineManager.getInstance();
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
