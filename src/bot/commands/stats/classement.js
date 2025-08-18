const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const LevelSystem = require('../../../core/levels/LevelSystem');
const logger = require('../../../shared/utils/logger');
const statsHelper = require('../../../shared/utils/StatsHelper');
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
            if (global.statsReporter) {
                await global.statsReporter.logCommand('classement', interaction);
            }
            await interaction.deferReply();

            const limit = interaction.options.getInteger('limite') || 10;

            logger.info('Leaderboard command executed:', {
                userId: interaction.user.id,
                guild: interaction.guild?.name,
                limit
            });

            // Récupérer le classement
            const leaderboard = await playerManager.getLeaderboard(limit);

            if (!leaderboard || leaderboard.length === 0) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('📊 Classement')
                    .setDescription('Aucune donnée de classement disponible.\nSoyez le premier à jouer avec `/guesscar` !');

                await interaction.editReply({ embeds: [noDataEmbed] });
                return;
            }

            const leaderboardEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 Classement des Champions')
                .setDescription(`**Top ${Math.min(limit, leaderboard.length)} des meilleurs joueurs**`);

            let leaderboardText = '';

            // Construire le texte du classement
            for (let i = 0; i < leaderboard.length; i++) {
                const player = leaderboard[i];
                const position = i + 1;

                // Icône de position
                let positionIcon;
                if (position === 1) positionIcon = '🥇';
                else if (position === 2) positionIcon = '🥈';
                else if (position === 3) positionIcon = '🥉';
                else positionIcon = `**${position}.**`;

                // Formater les statistiques avec validation
                const points = Math.round((player.totalDifficultyPoints || 0) * 10) / 10;

                // FIX: Validation du taux de réussite
                let successRate = 0;
                if (player.gamesPlayed > 0 && typeof player.gamesWon === 'number') {
                    successRate = Math.round((player.gamesWon / player.gamesPlayed) * 1000) / 10;
                } else if (typeof player.successRate === 'number' && !isNaN(player.successRate)) {
                    successRate = Math.round(player.successRate * 10) / 10;
                }

                const avgAttempts = Math.round((player.averageAttempts || 0) * 10) / 10;
                const avgTime = player.averageTime && player.averageTime > 0 ?
                    formatTime(Math.round(player.averageTime)) : 'N/A';

                // NOUVEAU: Obtenir le niveau du joueur
                const playerLevel = LevelSystem.getPlayerLevel(player.totalDifficultyPoints);

                leaderboardText += `${positionIcon} **${player.username}** ${playerLevel.emoji}\n`;
                leaderboardText += `└ ${playerLevel.title} • ${points} pts • ${player.gamesWon || 0}/${player.gamesPlayed || 0} parties • ${successRate}%\n\n`;
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
                        const points = Math.round((requesterStats.totalDifficultyPoints || 0) * 10) / 10;

                        // FIX: Validation du taux de réussite pour le demandeur
                        let successRate = 0;
                        if (requesterStats.gamesPlayed > 0 && typeof requesterStats.gamesWon === 'number') {
                            successRate = Math.round((requesterStats.gamesWon / requesterStats.gamesPlayed) * 1000) / 10;
                        } else if (typeof requesterStats.successRate === 'number' && !isNaN(requesterStats.successRate)) {
                            successRate = Math.round(requesterStats.successRate * 10) / 10;
                        }

                        const avgTime = requesterStats.averageTime && requesterStats.averageTime > 0 ?
                            formatTime(Math.round(requesterStats.averageTime)) : 'N/A';

                        // NOUVEAU: Niveau du demandeur
                        const requesterLevel = LevelSystem.getPlayerLevel(requesterStats.totalDifficultyPoints);

                        leaderboardEmbed.addFields({
                            name: '👤 Votre position',
                            value: `**#${requesterStats.ranking}** ${requesterLevel.emoji} ${requesterLevel.title}\n${points} pts • ${requesterStats.gamesWon || 0}/${requesterStats.gamesPlayed || 0} parties • ${successRate}%`,
                            inline: false
                        });
                    }

                    statsHelper.logCommand('classement', interaction.user.id);
                } catch (error) {
                    logger.warn('Could not fetch requester stats for leaderboard:', error);
                }
            }

            // Ajouter la légende mise à jour
            leaderboardEmbed.addFields({
                name: '📖 Légende',
                value: 'Points de difficulté • Victoires/Parties • Taux de réussite\n💡 Les niveaux sont basés sur vos points de difficulté totaux',
                inline: false
            });

            leaderboardEmbed.setFooter({
                text: `Demandé par ${interaction.user.username} • ${new Date().toLocaleString('fr-FR')}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            });

            await interaction.editReply({ embeds: [leaderboardEmbed] });

        } catch (error) {
            logger.error('Error in classement command:', { userId: interaction.user.id, error });

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération du classement.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

/**
 * Formate une durée en secondes en format lisible
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
