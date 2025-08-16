require('dotenv').config();
const logger = require('./shared/utils/logger');

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

        logger.info('🎉 Application started successfully!');

    } catch (error) {
        logger.error('❌ Failed to start application:', error);
        process.exit(1);
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
