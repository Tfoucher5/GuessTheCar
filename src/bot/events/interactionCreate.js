// src/bot/events/interactionCreate.js
const { Events, MessageFlags } = require('discord.js');
const logger = require('../../shared/utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Gérer les commandes slash
        if (interaction.isChatInputCommand()) {
            // Récupérer l'instance du commandHandler depuis le client
            await interaction.client.commandHandler.executeCommand(interaction);
            return;
        }

        // Gérer les boutons (si nécessaire pour le futur)
        if (interaction.isButton()) {
            logger.debug('Button interaction received:', {
                customId: interaction.customId,
                user: interaction.user.tag
            });

            await interaction.reply({
                content: 'Cette fonctionnalité n\'est pas encore implémentée.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Gérer les menus de sélection (si nécessaire pour le futur)
        if (interaction.isStringSelectMenu()) {
            logger.debug('Select menu interaction received:', {
                customId: interaction.customId,
                user: interaction.user.tag
            });

            await interaction.reply({
                content: 'Cette fonctionnalité n\'est pas encore implémentée.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Gérer les modales (si nécessaire pour le futur)
        if (interaction.isModalSubmit()) {
            logger.debug('Modal submit interaction received:', {
                customId: interaction.customId,
                user: interaction.user.tag
            });

            await interaction.reply({
                content: 'Cette fonctionnalité n\'est pas encore implémentée.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
    }
};
