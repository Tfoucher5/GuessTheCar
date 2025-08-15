const { SlashCommandBuilder } = require('discord.js');
const EmbedBuilder = require('../../../shared/utils/embedBuilder');
const logger = require('../../../shared/utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aide')
        .setDescription('Affiche les règles du jeu et les commandes disponibles'),

    async execute(interaction) {
        try {
            // Créer l'embed d'aide
            const helpEmbed = EmbedBuilder.createHelpEmbed();

            await interaction.reply({ embeds: [helpEmbed], ephemeral: true });

            logger.info('Help requested:', {
                userId: interaction.user.id,
                username: interaction.user.username
            });

        } catch (error) {
            logger.error('Error in aide command:', {
                userId: interaction.user.id,
                error: error.message
            });

            const errorEmbed = EmbedBuilder.createErrorEmbed(
                'Erreur',
                'Une erreur est survenue lors de l\'affichage de l\'aide.'
            );

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
