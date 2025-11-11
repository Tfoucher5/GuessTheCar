const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const LevelSystem = require('../../../core/levels/LevelSystem');
const logger = require('../../../shared/utils/logger');
const statsHelper = require('../../../shared/utils/StatsHelper');
const playerManager = new PlayerManager();

// Types de classements disponibles
const LEADERBOARD_TYPES = {
    GLOBAL: {
        id: 'global',
        name: 'Global (All-time)',
        emoji: '🏆',
        description: 'Classement par points totaux'
    },
    MONTHLY: {
        id: 'monthly',
        name: 'Mensuel',
        emoji: '📅',
        description: 'Classement du mois en cours'
    },
    SPEED: {
        id: 'speed',
        name: 'Vitesse',
        emoji: '⚡',
        description: 'Temps moyen le plus bas'
    },
    PRECISION: {
        id: 'precision',
        name: 'Précision',
        emoji: '🎯',
        description: 'Meilleur taux de réussite'
    },
    STREAKS: {
        id: 'streaks',
        name: 'Séries',
        emoji: '🔥',
        description: 'Plus longues séries de victoires'
    },
    ACTIVITY: {
        id: 'activity',
        name: 'Activité',
        emoji: '🎮',
        description: 'Le plus de parties jouées'
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('classement')
        .setDescription('Affiche les différents classements des joueurs')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type de classement à afficher')
                .setRequired(false)
                .addChoices(
                    { name: '🏆 Global (All-time)', value: 'global' },
                    { name: '📅 Mensuel', value: 'monthly' },
                    { name: '⚡ Vitesse', value: 'speed' },
                    { name: '🎯 Précision', value: 'precision' },
                    { name: '🔥 Séries', value: 'streaks' },
                    { name: '🎮 Activité', value: 'activity' }
                )
        )
        .addIntegerOption(option =>
            option
                .setName('limite')
                .setDescription('Nombre de joueurs à afficher (max 15)')
                .setMinValue(5)
                .setMaxValue(15)
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const type = interaction.options.getString('type') || 'global';
            const limit = interaction.options.getInteger('limite') || 10;
            const guildId = interaction.guild?.id;

            logger.info('Enhanced leaderboard command executed:', {
                userId: interaction.user.id,
                guild: interaction.guild?.name,
                guildId,
                type,
                limit
            });

            // Créer l'embed et les boutons selon le type
            const { embed, components } = await createLeaderboardDisplay(type, limit, guildId, interaction);

            await interaction.editReply({ embeds: [embed], components });

            statsHelper.logCommand('classement', interaction.user.id);

            // Créer un collector pour gérer les boutons de navigation
            const collector = interaction.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith('lb_'),
                time: 300000 // 5 minutes
            });

            collector.on('collect', async(buttonInteraction) => {
                try {
                    const [prefix, newType] = buttonInteraction.customId.split('_');

                    if (prefix === 'lb') {
                        const { embed: newEmbed, components: newComponents } = await createLeaderboardDisplay(
                            newType,
                            limit,
                            guildId,
                            interaction
                        );

                        await buttonInteraction.update({
                            embeds: [newEmbed],
                            components: newComponents
                        });
                    }
                } catch (error) {
                    logger.error('Error handling leaderboard button:', error);
                    await buttonInteraction.reply({
                        content: 'Erreur lors du changement de classement.',
                        ephemeral: true
                    });
                }
            });

            collector.on('end', async() => {
                try {
                    // Désactiver tous les boutons quand le collector expire
                    const disabledComponents = components.map(row => {
                        const newRow = new ActionRowBuilder();
                        row.components.forEach(button => {
                            newRow.addComponents(
                                ButtonBuilder.from(button).setDisabled(true)
                            );
                        });
                        return newRow;
                    });

                    await interaction.editReply({
                        embeds: [embed],
                        components: disabledComponents
                    });
                } catch (error) {
                    // Ignore les erreurs si le message a été supprimé
                    logger.debug('Could not disable leaderboard buttons:', error.message);
                }
            });

        } catch (error) {
            logger.error('Error in enhanced classement command:', {
                userId: interaction.user.id,
                guildId: interaction.guild?.id,
                error
            });

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération du classement.');

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

/**
 * Crée l'affichage du classement selon le type
 */
async function createLeaderboardDisplay(type, limit, guildId, interaction) {
    const leaderboardType = LEADERBOARD_TYPES[type.toUpperCase()] || LEADERBOARD_TYPES.GLOBAL;

    // Récupérer les données selon le type
    let leaderboard = [];

    switch (type) {
    case 'global':
        leaderboard = await playerManager.getLeaderboard(limit, guildId);
        break;
    case 'monthly':
        leaderboard = await playerManager.getMonthlyLeaderboard(limit, guildId);
        break;
    case 'speed':
        leaderboard = await playerManager.getSpeedLeaderboard(limit, guildId);
        break;
    case 'precision':
        leaderboard = await playerManager.getPrecisionLeaderboard(limit, guildId);
        break;
    case 'streaks':
        leaderboard = await playerManager.getStreaksLeaderboard(limit, guildId);
        break;
    case 'activity':
        leaderboard = await playerManager.getActivityLeaderboard(limit, guildId);
        break;
    default:
        leaderboard = await playerManager.getLeaderboard(limit, guildId);
    }

    // Créer l'embed
    const embed = createLeaderboardEmbed(leaderboard, leaderboardType, interaction.guild?.name, limit);

    // Ajouter la position du demandeur si pas dans le top
    await addRequesterPosition(embed, leaderboard, interaction, type, guildId);

    // Créer les boutons de navigation
    const components = createNavigationButtons(type);

    return { embed, components };
}

/**
 * Crée l'embed du classement
 */
function createLeaderboardEmbed(leaderboard, leaderboardType, guildName, limit) {
    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`${leaderboardType.emoji} ${leaderboardType.name} - ${guildName}`)
        .setDescription(`**${leaderboardType.description}**\n*Top ${Math.min(limit, leaderboard.length)} joueurs*`);

    if (!leaderboard || leaderboard.length === 0) {
        embed.setDescription('Aucune donnée pour ce classement.\nSoyez le premier à jouer avec `/guesscar` !');
        return embed;
    }

    let leaderboardText = '';

    for (let i = 0; i < leaderboard.length; i++) {
        const player = leaderboard[i];
        const position = i + 1;

        // Icône de position
        let positionIcon;
        if (position === 1) positionIcon = '🥇';
        else if (position === 2) positionIcon = '🥈';
        else if (position === 3) positionIcon = '🥉';
        else positionIcon = `**${position}.**`;

        // Niveau du joueur
        const playerLevel = LevelSystem.getPlayerLevel(player.totalPoints || 0);

        // Stats selon le type de classement
        const stats = formatPlayerStats(player, leaderboardType.id);

        leaderboardText += `${positionIcon} **${player.username}** ${playerLevel.emoji}\n`;
        leaderboardText += `└ ${stats}\n\n`;
    }

    embed.addFields({
        name: '📊 Classement',
        value: leaderboardText || 'Aucune donnée disponible',
        inline: false
    });

    // Légende selon le type
    const legend = getLeaderboardLegend(leaderboardType.id);
    embed.addFields({
        name: '📖 Légende',
        value: legend,
        inline: false
    });

    embed.setTimestamp();

    return embed;
}

/**
 * Formate les statistiques du joueur selon le type de classement
 */
function formatPlayerStats(player, type) {
    const points = Math.round((player.totalPoints || 0) * 10) / 10;
    const winRate = player.gamesPlayed > 0 ?
        Math.round((player.gamesWon / player.gamesPlayed) * 1000) / 10 : 0;

    switch (type) {
    case 'global':
        return `${points} pts • ${player.gamesWon || 0}/${player.gamesPlayed || 0} • ${winRate}%`;

    case 'monthly':
        // Pour le mensuel, on afficherait les stats du mois
        return `${points} pts ce mois • ${player.gamesWon || 0} victoires`;

    case 'speed':
    { const avgTime = player.averageTime && player.averageTime > 0 ?
        formatTime(Math.round(player.averageTime)) : 'N/A';
    return `⚡ ${avgTime} moyen • ${player.gamesWon || 0} victoires`; }

    case 'precision':
        return `🎯 ${winRate}% réussite • ${player.gamesPlayed || 0} parties`;

    case 'streaks':
        return `🔥 ${player.bestStreak || 0} série max • ${player.currentStreak || 0} actuelle`;

    case 'activity':
        return `🎮 ${player.gamesPlayed || 0} parties • ${player.gamesWon || 0} victoires`;

    default:
        return `${points} pts • ${player.gamesWon || 0}/${player.gamesPlayed || 0}`;
    }
}

/**
 * Retourne la légende appropriée selon le type de classement
 */
function getLeaderboardLegend(type) {
    switch (type) {
    case 'global':
        return 'Points totaux • Victoires/Parties • Taux de réussite';
    case 'monthly':
        return 'Statistiques du mois en cours';
    case 'speed':
        return 'Temps moyen par partie • Nombre de victoires';
    case 'precision':
        return 'Pourcentage de réussite • Nombre de parties';
    case 'streaks':
        return 'Meilleure série • Série actuelle';
    case 'activity':
        return 'Nombre total de parties • Victoires';
    default:
        return 'Statistiques générales';
    }
}

/**
 * Crée les boutons de navigation entre les classements
 */
function createNavigationButtons(currentType) {
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();

    // Première rangée
    Object.values(LEADERBOARD_TYPES).slice(0, 3).forEach(type => {
        const button = new ButtonBuilder()
            .setCustomId(`lb_${type.id}`)
            .setLabel(`${type.emoji} ${type.name}`)
            .setStyle(currentType === type.id ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(currentType === type.id);

        row1.addComponents(button);
    });

    // Deuxième rangée
    Object.values(LEADERBOARD_TYPES).slice(3).forEach(type => {
        const button = new ButtonBuilder()
            .setCustomId(`lb_${type.id}`)
            .setLabel(`${type.emoji} ${type.name}`)
            .setStyle(currentType === type.id ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(currentType === type.id);

        row2.addComponents(button);
    });

    return [row1, row2];
}

/**
 * Ajoute la position du demandeur s'il n'est pas dans le top
 */
async function addRequesterPosition(embed, leaderboard, interaction, type, guildId) {
    const requesterInTop = leaderboard.find(p => p.userId === interaction.user.id);

    if (!requesterInTop) {
        try {
            const requesterStats = await playerManager.getPlayerWithRanking(interaction.user.id, guildId);

            if (requesterStats && requesterStats.ranking) {
                const requesterLevel = LevelSystem.getPlayerLevel(requesterStats.totalPoints);
                const stats = formatPlayerStats(requesterStats, type);

                embed.addFields({
                    name: '👤 Votre position',
                    value: `**#${requesterStats.ranking}** ${requesterLevel.emoji} ${requesterLevel.title}\n${stats}`,
                    inline: false
                });
            }
        } catch (error) {
            logger.warn('Could not fetch requester stats for leaderboard:', error);
        }
    }
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
