const { SlashCommandBuilder } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const EmbedBuilder = require('../../../shared/utils/embedBuilder');
const logger = require('../../../shared/utils/logger');

const playerManager = new PlayerManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('classement')
        .setDescription('Affiche le classement des meilleurs joueurs')
        .addIntegerOption(option =>
            option.setName('limite')
                .setDescription('Nombre de joueurs à afficher (max 20)')
                .setMinValue(1)
                .setMaxValue(20)
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const limit = interaction.options.getInteger('limite') || 10;

            // Obtenir le classement
            const leaderboard = await playerManager.getLeaderboard(limit);

            // Créer l'embed du classement
            const leaderboardEmbed = EmbedBuilder.createLeaderboardEmbed(leaderboard);

            // Ajouter des informations supplémentaires si demandé
            if (leaderboard.length > 0) {
                const globalStats = await playerManager.getGlobalStats();

                leaderboardEmbed.addFields({
                    name: '📈 Statistiques globales',
                    value: `Total joueurs: ${globalStats.totalPlayers} | ` +
                        `Joueurs actifs: ${globalStats.activePlayers} | ` +
                        `Meilleur temps global: ${globalStats.bestGlobalTime}`,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [leaderboardEmbed] });

            logger.info('Leaderboard requested:', {
                userId: interaction.user.id,
                limit,
                playersCount: leaderboard.length
            });

        } catch (error) {
            logger.error('Error in classement command:', {
                userId: interaction.user.id,
                error: error.message
            });

            const errorEmbed = EmbedBuilder.createErrorEmbed(
                'Erreur',
                'Une erreur est survenue lors de la récupération du classement.'
            );

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
