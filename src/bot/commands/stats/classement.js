const { SlashCommandBuilder, EmbedBuilder , MessageFlags } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const logger = require('../../../shared/utils/logger');

const playerManager = new PlayerManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('classement')
        .setDescription('Affiche le classement des meilleurs joueurs')
        .addIntegerOption(option =>
            option
                .setName('limite')
                .setDescription('Nombre de joueurs à afficher (max 20)')
                .setMinValue(1)
                .setMaxValue(20)
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const limit = interaction.options.getInteger('limite') || 10;

            logger.info('Leaderboard command executed:', {
                userId: interaction.user.id,
                limit,
                guild: interaction.guild?.name
            });

            // Récupérer le classement
            const leaderboard = await playerManager.getLeaderboard(limit);

            if (!leaderboard || leaderboard.length === 0) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('🏆 Classement')
                    .setDescription('Aucun joueur n\'a encore de points.\nCommencez une partie avec `/guesscar` pour apparaître dans le classement !')
                    .setTimestamp()
                    .setFooter({
                        text: 'GuessTheCar Bot',
                        iconURL: interaction.client.user.displayAvatarURL()
                    });

                await interaction.editReply({ embeds: [noDataEmbed] });
                return;
            }

            // Créer l'embed du classement
            const leaderboardEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 Classement des Joueurs')
                .setDescription(`Top ${limit} des meilleurs joueurs`)
                .setTimestamp()
                .setFooter({
                    text: `${leaderboard.length} joueur(s) affiché(s)`,
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            // Ajouter les joueurs au classement
            let leaderboardText = '';

            for (let i = 0; i < leaderboard.length; i++) {
                const player = leaderboard[i];
                const position = i + 1;

                // Icônes pour les 3 premiers
                let positionIcon = '';
                if (position === 1) positionIcon = '🥇';
                else if (position === 2) positionIcon = '🥈';
                else if (position === 3) positionIcon = '🥉';
                else positionIcon = `**${position}.**`;

                // Formater les statistiques
                const points = Math.round(player.totalDifficultyPoints * 10) / 10;
                const successRate = Math.round(player.successRate * 10) / 10;
                const avgAttempts = Math.round(player.averageAttempts * 10) / 10;
                const avgTime = player.averageTime && player.averageTime > 0 ?
                    formatTime(Math.round(player.averageTime)) : 'N/A';

                leaderboardText += `${positionIcon} **${player.username}**\n`;
                leaderboardText += `└ ${points} pts • ${player.gamesWon}/${player.gamesPlayed} parties • ${successRate}% • ${avgAttempts} tent. • ${avgTime}\n\n`;
            }

            leaderboardEmbed.addFields({
                name: '📊 Classement',
                value: leaderboardText || 'Aucune donnée disponible',
                inline: false
            });

            // Ajouter les informations sur le demandeur s'il n'est pas dans le top
            const requesterInTop = leaderboard.find(p => p.userId === interaction.user.id);

            if (!requesterInTop) {
                try {
                    const requesterStats = await playerManager.getPlayerWithRanking(interaction.user.id);

                    if (requesterStats && requesterStats.ranking) {
                        const points = Math.round(requesterStats.totalDifficultyPoints * 10) / 10;
                        const successRate = Math.round(requesterStats.successRate * 10) / 10;
                        const avgTime = requesterStats.averageTime && requesterStats.averageTime > 0 ?
                            formatTime(Math.round(requesterStats.averageTime)) : 'N/A';

                        leaderboardEmbed.addFields({
                            name: '👤 Votre position',
                            value: `**#${requesterStats.ranking}** • ${points} pts • ${requesterStats.gamesWon}/${requesterStats.gamesPlayed} parties • ${successRate}% • ${avgTime}`,
                            inline: false
                        });
                    }
                } catch (error) {
                    logger.warn('Could not fetch requester stats for leaderboard:', error);
                }
            }

            // Ajouter la légende
            leaderboardEmbed.addFields({
                name: '📖 Légende',
                value: 'Points de difficulté • Victoires/Parties • Taux de réussite • Moy. tentatives • Temps moyen',
                inline: false
            });

            await interaction.editReply({ embeds: [leaderboardEmbed] });

        } catch (error) {
            logger.error('Error in leaderboard command:', {
                userId: interaction.user.id,
                error: error.message,
                stack: error.stack
            });

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Impossible de récupérer le classement pour le moment.')
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};

/**
 * Formate le temps en format lisible
 */
function formatTime(seconds) {
    if (!seconds || seconds <= 0) return 'N/A';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
}
