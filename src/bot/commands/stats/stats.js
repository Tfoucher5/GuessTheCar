const { SlashCommandBuilder } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const EmbedBuilder = require('../../../shared/utils/embedBuilder');
const logger = require('../../../shared/utils/logger');

const playerManager = new PlayerManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Affiche vos statistiques personnelles')
        .addUserOption(option =>
            option.setName('joueur')
                .setDescription('Voir les statistiques d\'un autre joueur')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const targetUser = interaction.options.getUser('joueur') || interaction.user;
            const isOwnStats = targetUser.id === interaction.user.id;

            try {
                // Obtenir les statistiques du joueur
                const playerStats = await playerManager.getPlayerStats(targetUser.id);

                // Créer l'embed des statistiques
                const statsEmbed = EmbedBuilder.createStatsEmbed(playerStats);

                // Modifier le titre si on regarde les stats d'un autre joueur
                if (!isOwnStats) {
                    statsEmbed.setTitle(`📊 Statistiques de ${targetUser.username}`);
                }

                await interaction.editReply({ embeds: [statsEmbed] });

                logger.info('Stats requested:', {
                    requesterId: interaction.user.id,
                    targetId: targetUser.id,
                    isOwnStats
                });

            } catch (error) {
                if (error.message.includes('non trouvé')) {
                    const noStatsEmbed = EmbedBuilder.createInfoEmbed(
                        '❌ Aucune statistique',
                        isOwnStats
                            ? 'Vous n\'avez pas encore joué ! Utilisez `/guesscar` pour commencer.'
                            : `${targetUser.username} n'a pas encore joué !`
                    );
                    await interaction.editReply({ embeds: [noStatsEmbed] });
                } else {
                    throw error;
                }
            }

        } catch (error) {
            logger.error('Error in stats command:', {
                userId: interaction.user.id,
                error: error.message
            });

            const errorEmbed = EmbedBuilder.createErrorEmbed(
                'Erreur',
                'Une erreur est survenue lors de la récupération des statistiques.'
            );

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
