const { Events } = require('discord.js');
const logger = require('../../shared/utils/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info(`Bot Discord prêt! Connecté en tant que ${client.user.tag}`);

        // Définir le statut du bot
        client.user.setActivity('🚗 Devine la voiture!', { type: 'Playing' });

        // Log des informations du bot
        logger.info(`Bot présent sur ${client.guilds.cache.size} serveurs`);
        logger.info(`Bot connecté à ${client.channels.cache.size} canaux`);
        logger.info(`Bot peut voir ${client.users.cache.size} utilisateurs`);
    }
};