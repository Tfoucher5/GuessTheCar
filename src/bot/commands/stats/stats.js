const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const { AppError } = require('../../../shared/errors');
const logger = require('../../../shared/utils/logger');

const playerManager = new PlayerManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Affiche vos statistiques personnelles')
        .addUserOption(option =>
            option
                .setName('joueur')
                .setDescription('Voir les statistiques d\'un autre joueur')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Déterminer quel joueur afficher
            const targetUser = interaction.options.getUser('joueur') || interaction.user;
            const userId = targetUser.id;
            const username = targetUser.username;

            logger.info('Stats command executed:', {
                requesterId: interaction.user.id,
                targetUserId: userId,
                guild: interaction.guild?.name
            });

            // Récupérer les statistiques du joueur avec son classement
            const playerStats = await playerManager.getPlayerWithRanking(userId);

            if (!playerStats) {
                // Créer le joueur s'il n'existe pas
                await playerManager.findOrCreatePlayer(userId, username);
                const newPlayer = await playerManager.getPlayerWithRanking(userId);

                const noStatsEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(`📊 Statistiques de ${username}`)
                    .setDescription('Aucune partie jouée pour le moment.\nCommencez une partie avec `/guesscar` !')
                    .addFields(
                        { name: '🎮 Parties jouées', value: '0', inline: true },
                        { name: '🏆 Parties gagnées', value: '0', inline: true },
                        { name: '⭐ Points totaux', value: '0', inline: true },
                        { name: '🎯 Niveau', value: 'Débutant', inline: true },
                        { name: '📈 Classement', value: 'Non classé', inline: true },
                        { name: '📊 Taux de réussite', value: '0%', inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'GuessTheCar Bot', iconURL: interaction.client.user.displayAvatarURL() });

                await interaction.editReply({ embeds: [noStatsEmbed] });
                return;
            }

            // Créer l'embed avec les statistiques complètes
            const statsEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`📊 Statistiques de ${playerStats.username}`)
                .setDescription(`**Niveau :** ${playerStats.skillLevel || 'Débutant'}\n**Classement :** #${playerStats.ranking || 'Non classé'}`)
                .addFields(
                    // Statistiques principales
                    {
                        name: '🎮 Parties',
                        value: `**Jouées :** ${playerStats.gamesPlayed || 0}\n**Gagnées :** ${playerStats.gamesWon || 0}\n**Taux :** ${playerStats.successRate || 0}%`,
                        inline: true
                    },
                    {
                        name: '⭐ Points',
                        value: `**Total :** ${playerStats.totalPoints || 0}\n**Difficulté :** ${playerStats.totalDifficultyPoints || 0}\n**Moyenne :** ${playerStats.gamesPlayed > 0 ? Math.round((playerStats.totalDifficultyPoints / playerStats.gamesPlayed) * 10) / 10 : 0}`,
                        inline: true
                    },
                    {
                        name: '🎯 Performance',
                        value: `**Série actuelle :** ${playerStats.currentStreak || 0}\n**Meilleure série :** ${playerStats.bestStreak || 0}\n**Moy. tentatives :** ${playerStats.averageAttempts || 0}`,
                        inline: true
                    },
                    // Statistiques détaillées
                    {
                        name: '🔍 Détails marques',
                        value: `**Trouvées :** ${playerStats.correctBrandGuesses || 0}\n**Tentatives :** ${playerStats.totalBrandGuesses || 0}\n**Précision :** ${playerStats.totalBrandGuesses > 0 ? Math.round((playerStats.correctBrandGuesses / playerStats.totalBrandGuesses) * 100) : 0}%`,
                        inline: true
                    },
                    {
                        name: '🚗 Détails modèles',
                        value: `**Trouvés :** ${playerStats.correctModelGuesses || 0}\n**Tentatives :** ${playerStats.totalModelGuesses || 0}\n**Précision :** ${playerStats.totalModelGuesses > 0 ? Math.round((playerStats.correctModelGuesses / playerStats.totalModelGuesses) * 100) : 0}%`,
                        inline: true
                    },
                    {
                        name: '⏱️ Temps',
                        value: `**Meilleur :** ${playerStats.bestTime ? formatTime(playerStats.bestTime) : 'N/A'}\n**Moyen :** ${playerStats.averageTime ? formatTime(Math.round(playerStats.averageTime)) : 'N/A'}`,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({
                    text: `Statistiques mises à jour`,
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            // Ajouter un thumbnail si c'est un autre joueur
            if (targetUser.id !== interaction.user.id) {
                statsEmbed.setThumbnail(targetUser.displayAvatarURL());
            }

            await interaction.editReply({ embeds: [statsEmbed] });

        } catch (error) {
            logger.error('Error in stats command:', {
                userId: interaction.user.id,
                error: error.message,
                stack: error.stack
            });

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Impossible de récupérer les statistiques pour le moment.')
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
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