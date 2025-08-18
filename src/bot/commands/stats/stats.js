const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const LevelSystem = require('../../../core/levels/LevelSystem');
const logger = require('../../../shared/utils/logger');
const statsHelper = require('../../../shared/utils/StatsHelper');
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
            if (global.statsReporter) {
                await global.statsReporter.logCommand('stats', interaction);
            }
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

                const noStatsEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(`📊 Statistiques de ${username}`)
                    .setDescription('Aucune partie jouée pour le moment.\nCommencez une partie avec `/guesscar` !')
                    .addFields({
                        name: '🎯 Niveau',
                        value: `*${LevelSystem.levels[0].title}*\n*${LevelSystem.levels[0].description}*`,
                        inline: false
                    });

                await interaction.editReply({ embeds: [noStatsEmbed] });
                return;
            }

            // ===== CALCULS CORRIGÉS =====
            // Vérification et calcul sécurisé des statistiques
            const points = isValidNumber(playerStats.totalDifficultyPoints) ?
                Math.round(playerStats.totalDifficultyPoints * 10) / 10 : 0;

            // FIX: Calcul corrigé du taux de réussite
            let successRate = 0;
            if (playerStats.gamesPlayed > 0 && typeof playerStats.gamesWon === 'number') {
                successRate = Math.round((playerStats.gamesWon / playerStats.gamesPlayed) * 1000) / 10;
            } else if (isValidNumber(playerStats.successRate)) {
                successRate = Math.round(playerStats.successRate * 10) / 10;
            }

            // FIX: Utiliser les bonnes propriétés du modèle Player

            // averageAttempts est un getter dans Player.js - il se calcule automatiquement
            let avgAttempts = 'N/A';
            if (playerStats.gamesPlayed > 0) {
                // Utiliser le getter averageAttempts qui existe dans Player.js
                const calculatedAttempts = (playerStats.totalBrandGuesses + playerStats.totalModelGuesses) / playerStats.gamesPlayed;
                avgAttempts = Math.round(calculatedAttempts * 10) / 10;
            }

            // averageTime n'existe pas dans Player.js, mais on a averageResponseTime
            let avgTime = 'N/A';
            if (isValidNumber(playerStats.averageResponseTime) && playerStats.averageResponseTime > 0) {
                avgTime = formatTime(Math.round(playerStats.averageResponseTime));
            }

            // NOUVEAU: Obtenir le niveau du joueur
            const playerLevel = LevelSystem.getPlayerLevel(playerStats.totalDifficultyPoints);
            const progressInfo = LevelSystem.getProgressToNextLevel(playerStats.totalDifficultyPoints);

            // Créer l'embed avec le niveau
            const statsEmbed = new EmbedBuilder()
                .setColor(LevelSystem.hexToDecimal(playerLevel.color))
                .setTitle(`📊 Statistiques de ${username}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

            // NOUVEAU: Ajouter le niveau en premier
            let levelText = `*${playerLevel.title}*\n*${playerLevel.description}*\n\n`;

            if (!progressInfo.isMaxLevel) {
                const progressBar = LevelSystem.generateProgressBar(progressInfo.progressPercentage);
                levelText += `**Progression:** ${progressBar} ${Math.round(progressInfo.progressPercentage)}%\n`;
                levelText += `**Prochain niveau:** ${progressInfo.nextLevelTitle}\n`;
                levelText += `**Points nécessaires:** ${progressInfo.pointsNeeded}`;
            } else {
                levelText += progressInfo.message;
            }

            statsEmbed.addFields({
                name: '🎯 Niveau & Progression',
                value: levelText,
                inline: false
            });

            // Ajouter les statistiques de base avec vérifications
            statsEmbed.addFields(
                {
                    name: '🏁 Résultats',
                    value: `**Parties:** ${playerStats.gamesPlayed || 0}\n**Victoires:** ${playerStats.gamesWon || 0}\n**Taux de réussite:** ${successRate}%`,
                    inline: true
                },
                {
                    name: '🏆 Points & Classement',
                    value: `**Points de difficulté:** ${points}\n**Classement:** #${playerStats.ranking || 'N/A'}\n**Série actuelle:** ${playerStats.currentStreak || 0}`,
                    inline: true
                },
                {
                    name: '⏱️ Performance',
                    value: `**Temps moyen:** ${avgTime}\n**Tentatives moy.:** ${avgAttempts}\n**Meilleur temps:** ${playerStats.bestTime ? formatTime(playerStats.bestTime) : 'N/A'}`,
                    inline: true
                }
            );

            // Ajouter les détails de devinettes avec vérifications
            if (playerStats.totalBrandGuesses > 0 || playerStats.totalModelGuesses > 0) {
                const brandAccuracy = playerStats.totalBrandGuesses > 0
                    ? Math.round((playerStats.correctBrandGuesses / playerStats.totalBrandGuesses) * 100)
                    : 0;
                const modelAccuracy = playerStats.totalModelGuesses > 0
                    ? Math.round((playerStats.correctModelGuesses / playerStats.totalModelGuesses) * 100)
                    : 0;

                statsEmbed.addFields({
                    name: '🎯 Précision des devinettes',
                    value: `**Marques:** ${playerStats.correctBrandGuesses || 0}/${playerStats.totalBrandGuesses || 0} (${brandAccuracy}%)\n**Modèles:** ${playerStats.correctModelGuesses || 0}/${playerStats.totalModelGuesses || 0} (${modelAccuracy}%)`,
                    inline: false
                });
            }

            // Footer avec informations supplémentaires
            statsEmbed.setFooter({
                text: `Meilleure série: ${playerStats.bestStreak || 0} • Membre depuis: ${new Date(playerStats.createdAt).toLocaleDateString('fr-FR')}`
            });

            await interaction.editReply({ embeds: [statsEmbed] });

            statsHelper.logCommand('stats', interaction.user.id);

        } catch (error) {
            logger.error('Error in stats command:', { userId: interaction.user.id, error });

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération des statistiques.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

/**
 * Vérifie si une valeur est un nombre valide
 */
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

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
