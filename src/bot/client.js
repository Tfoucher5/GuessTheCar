const { Client } = require('discord.js');
const discordConfig = require('../shared/config/discord');
const logger = require('../shared/utils/logger');

// Handlers
const eventHandler = require('./handlers/eventHandler');
const commandHandler = require('./handlers/commandHandler');

// Créer le client Discord
const client = new Client({
    intents: discordConfig.intents
});

// Charger les gestionnaires d'événements
eventHandler.loadEvents(client);

// Charger et enregistrer les commandes
commandHandler.loadCommands();

// Événement de connexion
client.once('ready', async() => {
    logger.info(`Discord Bot connecté: ${client.user.tag}`);
    logger.info(`Bot présent sur ${client.guilds.cache.size} serveurs`);

    // Enregistrer les commandes slash
    try {
        await commandHandler.registerCommands(client);
        logger.info('Commandes Slash enregistrées avec succès');
    } catch (error) {
        logger.error('Erreur lors de l\'enregistrement des commandes:', error);
    }
});

// Gestion des erreurs du client
client.on('error', (error) => {
    logger.error('Erreur du client Discord:', error);
});

client.on('warn', (warning) => {
    logger.warn('Avertissement Discord:', warning);
});

// Gestion de la déconnexion
client.on('disconnect', () => {
    logger.warn('Bot Discord déconnecté');
});

// Gestion de la reconnexion
client.on('reconnecting', () => {
    logger.info('Bot Discord en cours de reconnexion...');
});

// Gestion gracieuse de l'arrêt
process.on('SIGINT', async() => {
    logger.info('Arrêt du bot Discord...');
    client.destroy();
});

process.on('SIGTERM', async() => {
    logger.info('Arrêt du bot Discord...');
    client.destroy();
});

module.exports = client;
