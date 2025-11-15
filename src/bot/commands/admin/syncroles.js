const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const roleManager = require('../../../core/roles/RoleManager');
const PlayerManager = require('../../../core/player/PlayerManager');
const levelSystem = require('../../../core/levels/LevelSystem');
const logger = require('../../../shared/utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('syncroles')
        .setDescription('Synchronise les rôles Discord avec les niveaux de jeu (Admin uniquement)')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à synchroniser (admin uniquement)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            // Defer immédiatement pour éviter le timeout
            await interaction.deferReply({ ephemeral: true });

            if (!interaction.guild) {
                return await interaction.editReply({
                    content: '❌ Cette commande doit être utilisée sur un serveur Discord.',
                    ephemeral: true
                });
            }

            // Vérifier si c'est le serveur officiel
            if (!roleManager.isOfficialGuild(interaction.guild.id)) {
                return await interaction.editReply({
                    content: '❌ La gestion des rôles est uniquement disponible sur le serveur officiel GuessTheCar.',
                    ephemeral: true
                });
            }

            const targetUser = interaction.options.getUser('utilisateur');
            const userId = targetUser ? targetUser.id : interaction.user.id;
            const username = targetUser ? targetUser.username : interaction.user.username;

            const playerManager = new PlayerManager();
            const guildId = interaction.guild.id;

            // Récupérer les stats du joueur
            const playerStats = await playerManager.getPlayerWithRanking(userId, guildId);

            if (!playerStats) {
                return await interaction.editReply({
                    content: `❌ ${targetUser ? username : 'Vous'} n'${targetUser ? 'a' : 'avez'} pas encore joué à GuessTheCar.`,
                    ephemeral: true
                });
            }

            const prestigePoints = playerStats.prestigePoints || playerStats.prestige_points || 0;
            const prestigeLevel = playerStats.prestigeLevel || playerStats.prestige_level || 0;

            // Calculer le niveau actuel
            const currentLevel = await levelSystem.getPlayerLevelWithPrestige(prestigePoints, prestigeLevel);
            const currentLevelNumber = currentLevel.levelIndex + 1;

            // Synchroniser les rôles
            await roleManager.syncUserRoles(
                interaction.guild,
                userId,
                currentLevelNumber,
                prestigeLevel
            );

            const prestigeInfo = roleManager.prestigeRoles[prestigeLevel];
            const prestigeName = prestigeInfo ? prestigeInfo.name : 'Normal';

            await interaction.editReply({
                content: `✅ Rôles synchronisés avec succès !\n\n` +
                    `👤 Utilisateur: ${username}\n` +
                    `📊 Niveau: ${currentLevel.emoji} **${currentLevelNumber}** - ${currentLevel.title}\n` +
                    `🎖️ Prestige: **${prestigeName}** (Prestige ${prestigeLevel})\n` +
                    `💎 Points: **${prestigePoints.toLocaleString()}**`,
                ephemeral: true
            });

            logger.info('Roles manually synced:', {
                userId,
                username,
                guildId,
                level: currentLevelNumber,
                prestigeLevel,
                syncedBy: interaction.user.id
            });

        } catch (error) {
            logger.error('Error in syncroles command:', error);
            const errorMessage = error.message || 'Une erreur est survenue lors de la synchronisation des rôles.';

            if (interaction.deferred) {
                await interaction.editReply({
                    content: `❌ **Erreur:** ${errorMessage}`,
                    ephemeral: true
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

