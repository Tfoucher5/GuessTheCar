const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const logger = require('../../../shared/utils/logger');
const statsHelper = require('../../../shared/utils/StatsHelper');
const playerManager = new PlayerManager();

/**
 * Génère une barre de progression visuelle
 */
function getProgressBar(percentage) {
    // Vérifier que percentage est un nombre valide
    if (isNaN(percentage) || percentage === null || percentage === undefined) {
        percentage = 0;
    }

    const barLength = 15;
    const filled = Math.floor((percentage / 100) * barLength);
    const empty = barLength - filled;

    return '█'.repeat(filled) + '░'.repeat(empty);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collection')
        .setDescription('Affiche le classement des collectionneurs de voitures'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Collection inter-serveur : pas de guildId
            const leaderboard = await playerManager.getCollectionLeaderboard(10, null);
            const userStats = await playerManager.getPlayerCollection(interaction.user.id, null);
            const completionPercentage = Math.round((userStats.carsFound / userStats.totalCars) * 100 * 10) / 10;

            const collectionEmbed = new EmbedBuilder()
                .setColor('#FF6B35')
                .setTitle(`🏁 Classement des collections`)
                .setDescription('**Qui a découvert le plus de voitures ?**\n');

            if (leaderboard.length === 0) {
                collectionEmbed.setDescription('Aucun collectionneur pour le moment !\nCommencez à collectionner avec `/guesscar` !');
            } else {
                let leaderboardText = '';

                leaderboard.forEach((player, index) => {
                    const position = index + 1;
                    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏆';
                    player.completionPercentage = Math.round((player.carsFound / userStats.totalCars) * 100 * 10) / 10;

                    leaderboardText += `${medal} **${player.username}**\n`;
                    leaderboardText += `└ ${player.carsFound}/${userStats.totalCars} voitures (${player.completionPercentage}%)\n`;
                    leaderboardText += `└ ${player.brandsFound}/${userStats.totalBrands} marques\n\n`;
                });

                collectionEmbed.addFields({
                    name: '🏆 Top Collectionneurs',
                    value: leaderboardText,
                    inline: false
                });
            }

            // Ajouter les stats de l'utilisateur
            if (userStats && userStats.carsFound > 0) {
                const completionPercentage = Math.round((userStats.carsFound / userStats.totalCars) * 100 * 10) / 10;

                collectionEmbed.addFields({
                    name: '📊 Votre Collection',
                    value: `**Voitures:** ${userStats.carsFound}/${userStats.totalCars} (${completionPercentage}%)\n` +
                        `**Marques:** ${userStats.brandsFound}/${userStats.totalBrands}\n` +
                        `**Progression:** ${getProgressBar(completionPercentage)}`,
                    inline: false
                });
            } else {
                collectionEmbed.addFields({
                    name: '📊 Votre Collection',
                    value: 'Vous n\'avez encore trouvé aucune voiture !\nCommencez votre collection avec `/guesscar` !',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [collectionEmbed] });

            statsHelper.logCommand('collection', interaction.user.id);

        } catch (error) {
            logger.error('Error in collection command:', { guildId: interaction.guild?.id, error });

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération de la collection.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
