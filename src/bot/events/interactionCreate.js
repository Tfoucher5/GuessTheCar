const { Events } = require('discord.js');
const commandHandler = require('../handlers/commandHandler');
const logger = require('../../shared/utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Gérer les commandes slash
        if (interaction.isChatInputCommand()) {
            await commandHandler.executeCommand(interaction);
            return;
        }

        // Gérer les boutons (si nécessaire pour le futur)
        if (interaction.isButton()) {
            logger.debug('Button interaction received:', {
                customId: interaction.customId,
                user: interaction.user.tag
            });

            // Ici on pourrait ajouter la logique des boutons
            await interaction.reply({
                content: 'Cette fonctionnalité n\'est pas encore implémentée.',
                ephemeral: true
            });
            return;
        }

        // Gérer les menus de sélection (si nécessaire pour le futur)
        if (interaction.isSelectMenu()) {
            logger.debug('Select menu interaction received:', {
                customId: interaction.customId,
                user: interaction.user.tag
            });

            await interaction.reply({
                content: 'Cette fonctionnalité n\'est pas encore implémentée.',
                ephemeral: true
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
                ephemeral: true
            });
            return;
        }
    }
};