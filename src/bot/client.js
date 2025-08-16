// src/bot/client.js
const { Client } = require('discord.js');
const discordConfig = require('../shared/config/discord');
const logger = require('../shared/utils/logger');

// Handlers
const eventHandler = require('./handlers/eventHandler');
const CommandHandler = require('./handlers/commandHandler');

// Créer le client Discord
const client = new Client({
    intents: discordConfig.intents
});

// Créer une instance du CommandHandler
const commandHandler = new CommandHandler(client);

// Charger les gestionnaires d'événements
eventHandler.loadEvents(client);

// Événement de connexion
client.once('ready', async() => {
    logger.info(`Discord Bot connecté: ${client.user.tag}`);
    logger.info(`Bot présent sur ${client.guilds.cache.size} serveurs`);

    try {
        // Charger et enregistrer les commandes
        await commandHandler.loadCommands();
        await commandHandler.registerCommands();
        logger.info('Commandes Discord chargées et enregistrées avec succès');
    } catch (error) {
        logger.error('Erreur lors du chargement des commandes:', error);
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

// Exporter les deux pour compatibilité
module.exports = client;
module.exports.commandHandler = commandHandler;
