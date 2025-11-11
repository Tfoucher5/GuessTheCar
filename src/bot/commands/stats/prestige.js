const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const PlayerManager = require('../../../core/player/PlayerManager');
const prestigeSystem = require('../../../core/prestige/PrestigeSystem');
const levelSystem = require('../../../core/levels/LevelSystem');
const logger = require('../../../shared/utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prestige')
        .setDescription('Monter en prestige pour un défi encore plus grand !'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const playerManager = new PlayerManager();
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const guildId = interaction.guild?.id || null;

            // Récupérer les stats du joueur
            const playerStats = await playerManager.getPlayerWithRanking(userId, guildId);

            if (!playerStats) {
                return await interaction.editReply({
                    content: '❌ Vous devez d\'abord jouer au moins une partie !',
                    ephemeral: true
                });
            }

            const prestigePoints = playerStats.prestigePoints || playerStats.total_points || 0;
            const prestigeLevel = playerStats.prestigeLevel || playerStats.prestige_level || 0;

            // Obtenir le niveau actuel
            const currentLevel = await levelSystem.getPlayerLevelWithPrestige(prestigePoints, prestigeLevel);
            const currentLevelNumber = currentLevel.levelIndex + 1; // levelIndex est 0-based

            // Vérifier si peut prestigier
            const canPrestige = await prestigeSystem.canPrestige(
                prestigePoints,
                prestigeLevel,
                currentLevelNumber
            );

            // Si ne peut pas prestigier
            if (!canPrestige.canPrestige) {
                const currentPrestigeInfo = await prestigeSystem.getPrestigeLevel(prestigeLevel);
                const pointsProgress = await prestigeSystem.getPointsToNextPrestige(prestigeLevel, prestigePoints);

                const embed = new EmbedBuilder()
                    .setColor('#FF6B35')
                    .setTitle('🔒 Prestige Verrouillé')
                    .setDescription(canPrestige.reason)
                    .addFields(
                        {
                            name: '📊 Votre Niveau Actuel',
                            value: `${currentLevel.emoji} **Niveau ${currentLevelNumber}** - ${currentLevel.title}`,
                            inline: false
                        },
                        {
                            name: '🎖️ Prestige Actuel',
                            value: prestigeLevel === 0
                                ? '**Aucun prestige** - Atteignez le niveau 20 !'
                                : `${currentPrestigeInfo.emoji} **${currentPrestigeInfo.name}** (Prestige ${prestigeLevel})`,
                            inline: false
                        }
                    );

                if (currentLevelNumber < 20) {
                    embed.addFields({
                        name: '🎯 Pour Débloquer le Prestige',
                        value: `Atteignez le **niveau 20** (🧠 Sylvain Lyve)`,
                        inline: false
                    });
                }

                return await interaction.editReply({ embeds: [embed] });
            }

            // Le joueur PEUT prestigier - Demander confirmation
            const nextPrestige = canPrestige.nextPrestigeInfo;

            const confirmEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('👑 Monter en Prestige ?')
                .setDescription(
                    `Vous êtes sur le point de monter en **${nextPrestige.emoji} Prestige ${nextPrestige.id} - ${nextPrestige.name}** !\n\n` +
                    `**⚠️ Attention :**\n` +
                    `• Vous recommencerez au **niveau 1**\n` +
                    `• Il faudra **${nextPrestige.multiplier}x plus de points** pour progresser\n` +
                    `• Votre historique total restera intact\n` +
                    `• Vous obtiendrez un badge de prestige ${nextPrestige.emoji}\n\n` +
                    `**💎 Avantage :**\n` +
                    `• Montrez votre détermination avec ${nextPrestige.emoji}\n` +
                    `• Défiez-vous avec une progression plus difficile\n` +
                    `• Rejoignez l'élite des joueurs prestigieux !`
                )
                .addFields(
                    {
                        name: '📊 Prestige Actuel',
                        value: prestigeLevel === 0 ? 'Aucun' : `Prestige ${prestigeLevel}`,
                        inline: true
                    },
                    {
                        name: '🎯 Nouveau Prestige',
                        value: `${nextPrestige.emoji} Prestige ${nextPrestige.id}`,
                        inline: true
                    },
                    {
                        name: '⚡ Nouvelle Difficulté',
                        value: `${nextPrestige.multiplier}x les points requis`,
                        inline: true
                    }
                )
                .setFooter({ text: 'Réfléchissez bien avant de confirmer !' })
                .setTimestamp();

            const confirmButton = new ButtonBuilder()
                .setCustomId('prestige_confirm')
                .setLabel('✅ Confirmer le Prestige')
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId('prestige_cancel')
                .setLabel('❌ Annuler')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

            const response = await interaction.editReply({
                embeds: [confirmEmbed],
                components: [row]
            });

            // Attendre la réponse (30 secondes)
            const collectorFilter = i => i.user.id === interaction.user.id;
            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 30000
                });

                if (confirmation.customId === 'prestige_confirm') {
                    // Faire prestigier le joueur
                    const result = await playerManager.prestigePlayer(userId, guildId);

                    const successEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle(`${nextPrestige.emoji} PRESTIGE RÉUSSI ! ${nextPrestige.emoji}`)
                        .setDescription(
                            `**Félicitations ${username} !**\n\n` +
                            `Vous êtes maintenant **${nextPrestige.emoji} Prestige ${result.newPrestigeLevel} - ${nextPrestige.name}** !\n\n` +
                            `🔄 Vous recommencez au niveau 1\n` +
                            `⚡ Difficulté: **${nextPrestige.multiplier}x** les points requis\n` +
                            `💎 Total historique: **${playerStats.total_points.toLocaleString()} points**\n\n` +
                            `**Bonne chance pour cette nouvelle aventure !** 🚀`
                        )
                        .setTimestamp();

                    await confirmation.update({
                        embeds: [successEmbed],
                        components: []
                    });

                    logger.info('Player prestiged via command:', {
                        userId,
                        username,
                        guildId,
                        newPrestigeLevel: result.newPrestigeLevel
                    });

                } else if (confirmation.customId === 'prestige_cancel') {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor('#FF6B35')
                        .setTitle('❌ Prestige Annulé')
                        .setDescription('Vous avez choisi de ne pas monter en prestige.\nVous pouvez revenir quand vous voulez !')
                        .setTimestamp();

                    await confirmation.update({
                        embeds: [cancelEmbed],
                        components: []
                    });
                }

            } catch (error) {
                // Timeout
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#808080')
                    .setTitle('⏱️ Temps Écoulé')
                    .setDescription('Vous n\'avez pas répondu à temps.\nUtilisez `/prestige` à nouveau si vous souhaitez monter en prestige.')
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [timeoutEmbed],
                    components: []
                });
            }

        } catch (error) {
            logger.error('Error in prestige command:', error);
            const errorMessage = error.message || 'Une erreur est survenue lors de la tentative de prestige.';

            if (interaction.deferred) {
                await interaction.editReply({
                    content: `❌ **Erreur:** ${errorMessage}`,
                    embeds: [],
                    components: []
                });
            } else {
                await interaction.reply({
                    content: `❌ **Erreur:** ${errorMessage}`,
                    ephemeral: true
                });
            }
        }
    }
};
