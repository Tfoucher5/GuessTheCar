// src/bot/events/interactionCreate.js
const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../shared/utils/logger');
const GameEngineManager = require('../../core/game/GameEngineManager');
const EmbedBuilder = require('../utils/embedBuilder');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Gérer les commandes slash
        if (interaction.isChatInputCommand()) {
            // Récupérer l'instance du commandHandler depuis le client
            await interaction.client.commandHandler.executeCommand(interaction);
            return;
        }

        // Gérer les boutons de jeu
        if (interaction.isButton()) {
            await handleGameButton(interaction);
            return;
        }

        // Gérer les menus de sélection (si nécessaire pour le futur)
        if (interaction.isStringSelectMenu()) {
            logger.debug('Select menu interaction received:', {
                customId: interaction.customId,
                user: interaction.user.tag
            });

            await interaction.reply({
                content: 'Cette fonctionnalité n\'est pas encore implémentée.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Gérer les modales (si nécessaire pour le futur)
        if (interaction.isModalSubmit()) {
            logger.debug('Modal submit interaction received:', {
                customId: interaction.customId,
                user: interaction.user.tag
            });

            await interaction.reply({
                content: 'Cette fonctionnalité n\'est pas encore implémentée.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
    }
};

/**
 * Gère les interactions des boutons de jeu
 */
async function handleGameButton(interaction) {
    try {
        const customId = interaction.customId;

        // Parser le type de bouton depuis le customId
        // Format: game_TYPE_THREADID
        const parts = customId.split('_');
        const action = parts[0];
        const type = parts[1];

        // IMPORTANT : Utiliser interaction.channelId au lieu de parser le threadId
        // C'est plus fiable car le channelId est toujours le channel actuel
        const threadId = interaction.channelId;

        logger.debug('Game button clicked:', {
            customId,
            action,
            type,
            threadId,
            userId: interaction.user.id,
            channel: {
                id: interaction.channel?.id,
                type: interaction.channel?.type,
                isThread: interaction.channel?.isThread()
            }
        });

        if (action !== 'game') return;

        // Récupérer l'instance du GameEngine
        const gameEngine = GameEngineManager.getInstance();

        // Logging détaillé pour diagnostiquer le problème
        const allActiveGames = gameEngine.getAllActiveGames();
        logger.debug('Active games status:', {
            totalActiveGames: allActiveGames.length,
            activeGameThreadIds: allActiveGames.map(g => g.threadId),
            requestedThreadId: threadId
        });

        // Vérifier que l'utilisateur a une partie active dans ce thread
        const activeGame = gameEngine.getActiveGame(threadId);

        if (!activeGame) {
            logger.error('No active game found for thread:', {
                requestedThreadId: threadId,
                userId: interaction.user.id,
                allActiveGames: allActiveGames.map(g => ({
                    threadId: g.threadId,
                    userId: g.gameState.userId,
                    username: g.gameState.username
                }))
            });

            await interaction.reply({
                content: '❌ Aucune partie active trouvée dans ce fil. La partie a peut-être expiré.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (activeGame.userId !== interaction.user.id) {
            logger.warn('Game belongs to different user:', {
                gameUserId: activeGame.userId,
                requestUserId: interaction.user.id,
                threadId: threadId
            });

            await interaction.reply({
                content: '❌ Cette partie ne vous appartient pas.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        logger.debug('Game button validation passed:', {
            threadId,
            userId: interaction.user.id,
            buttonType: type
        });

        // Traiter selon le type de bouton
        switch (type) {
        case 'hint': {
            await handleHintButton(interaction, threadId, activeGame);
            break;
        }

        case 'change': {
            await handleChangeButton(interaction, threadId, activeGame);
            break;
        }

        case 'abandon': {
            await handleAbandonButton(interaction, threadId, activeGame);
            break;
        }

        default: {
            logger.warn('Unknown game button type:', type);
            await interaction.reply({
                content: '❌ Action inconnue.',
                flags: MessageFlags.Ephemeral
            });
        }
        }

    } catch (error) {
        logger.error('Error handling game button:', error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ Une erreur est survenue lors du traitement de votre action.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}

/**
 * Gère le bouton d'indice
 */
async function handleHintButton(interaction, threadId, gameState) {
    try {
        const gameEngine = GameEngineManager.getInstance();
        const result = gameEngine.getHint(threadId);

        // Récupérer le gameState mis à jour après l'indice
        const updatedGameState = gameEngine.getActiveGame(threadId);

        const hintEmbed = EmbedBuilder.createGameEmbed(updatedGameState, {
            color: '#FFA500',
            title: '💡 Indice',
            description: result.message
        });

        // Mettre à jour les boutons avec le nouvel état
        const updatedButtons = EmbedBuilder.updateGameButtons(updatedGameState);

        await interaction.reply({
            embeds: [hintEmbed],
            components: [updatedButtons],
            ephemeral: false
        });

    } catch (error) {
        logger.error('Error handling hint button:', error);
        await interaction.reply({
            content: '❌ Impossible d\'obtenir un indice pour le moment.',
            flags: MessageFlags.Ephemeral
        });
    }
}

/**
 * Gère le bouton de changement de voiture
 */
async function handleChangeButton(interaction, threadId) {
    try {
        logger.debug('Change car button - starting', {
            threadId,
            userId: interaction.user.id,
            channelId: interaction.channelId
        });

        const gameEngine = GameEngineManager.getInstance();

        logger.debug('Change car button - calling changeCar', { threadId });
        const result = await gameEngine.changeCar(threadId);
        logger.debug('Change car button - changeCar result', { result });

        // Récupérer l'état mis à jour
        const updatedGameState = gameEngine.getActiveGame(threadId);

        if (!updatedGameState) {
            logger.error('Change car button - no game state after changeCar!', { threadId });
            throw new Error('État du jeu introuvable après changement');
        }

        const newCar = updatedGameState.car;
        const country = newCar.country || 'Inconnu';

        logger.debug('Change car button - creating embed', {
            carName: newCar.getFullName(),
            changesRemaining: result.changesRemaining
        });

        const changeEmbed = EmbedBuilder.createGameEmbed(updatedGameState, {
            title: '🔄 Nouvelle voiture',
            description: 'Voiture changée ! Devine la **marque** de la nouvelle voiture.\n\n' +
                `🌍 **Pays d'origine:** ${country}\n\n` +
                `*Changements restants: ${result.changesRemaining}*`
        });

        // Mettre à jour les boutons
        const updatedButtons = EmbedBuilder.updateGameButtons(updatedGameState);

        logger.debug('Change car button - sending reply');
        await interaction.reply({
            embeds: [changeEmbed],
            components: [updatedButtons],
            ephemeral: false
        });

        logger.debug('Change car button - success');

    } catch (error) {
        logger.error('Error handling change button:', {
            error: error.message,
            stack: error.stack,
            threadId,
            userId: interaction.user.id
        });

        const errorMessage = error.message === 'Limite de changements de voiture atteinte'
            ? '❌ Vous avez atteint la limite de changements de voiture (3 maximum).'
            : `❌ Impossible de changer de voiture pour le moment. (${error.message})`;

        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: errorMessage,
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (replyError) {
            logger.error('Failed to send error reply for change button:', replyError);
        }
    }
}

/**
 * Gère le bouton d'abandon
 */
async function handleAbandonButton(interaction, threadId, gameState) {
    try {
        // Demander confirmation avec des boutons
        const confirmEmbed = EmbedBuilder.createWarningEmbed(
            'Confirmation d\'abandon',
            'Êtes-vous sûr de vouloir abandonner cette partie ?'
        );

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_abandon')
            .setLabel('✅ Oui, abandonner')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_abandon')
            .setLabel('❌ Annuler')
            .setStyle(ButtonStyle.Secondary);

        const confirmRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow],
            flags: MessageFlags.Ephemeral
        });

        // Créer un collector pour les boutons de confirmation
        const filter = (i) => {
            return i.user.id === interaction.user.id &&
                (i.customId === 'confirm_abandon' || i.customId === 'cancel_abandon');
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 30000,
            max: 1
        });

        collector.on('collect', async(confirmInteraction) => {
            if (confirmInteraction.customId === 'cancel_abandon') {
                await confirmInteraction.update({
                    content: '✅ Abandon annulé - Continuez votre partie !',
                    embeds: [],
                    components: []
                });
                return;
            }

            // Confirmer l'abandon
            try {
                const gameEngine = GameEngineManager.getInstance();
                const result = await gameEngine.abandonGame(threadId);

                const abandonEmbed = EmbedBuilder.createAbandonEmbed(
                    gameState,
                    result.correctAnswer,
                    result.score
                );

                // Envoyer le message d'abandon dans le thread
                await interaction.channel.send({ embeds: [abandonEmbed] });

                // Synchroniser les rôles si des points ont été gagnés
                if (result.score && result.score.totalPoints > 0 && interaction.guild) {
                    try {
                        const playerManager = new PlayerManager();
                        const guildId = interaction.guild.id;
                        const userId = interaction.user.id;

                        const playerStats = await playerManager.getPlayerWithRanking(userId, guildId);

                        if (playerStats) {
                            const prestigePoints = playerStats.prestigePoints || playerStats.prestige_points || 0;
                            const prestigeLevel = playerStats.prestigeLevel || playerStats.prestige_level || 0;

                            const currentLevel = await levelSystem.getPlayerLevelWithPrestige(prestigePoints, prestigeLevel);
                            const currentLevelNumber = currentLevel.levelIndex + 1;

                            await roleManager.syncUserRoles(
                                interaction.guild,
                                userId,
                                currentLevelNumber,
                                prestigeLevel
                            );
                        }
                    } catch (roleError) {
                        logger.error('Error syncing roles after abandon:', roleError);
                    }
                }

                await confirmInteraction.update({
                    content: '✅ Partie abandonnée avec succès.',
                    embeds: [],
                    components: []
                });

                // Programmer la fermeture du thread
                setTimeout(async() => {
                    try {
                        if (interaction.channel.isThread()) {
                            const closeEmbed = EmbedBuilder.createInfoEmbed(
                                '🔒 Fermeture du fil',
                                'Ce fil va être supprimé dans 1 minute.'
                            );

                            await interaction.channel.send({ embeds: [closeEmbed] });
                            await interaction.channel.setLocked(true);

                            setTimeout(async() => {
                                try {
                                    await interaction.channel.delete();
                                } catch (error) {
                                    logger.error('Error deleting thread:', error);
                                }
                            }, 60000);
                        }
                    } catch (error) {
                        logger.error('Error closing thread:', error);
                    }
                }, 5000);

            } catch (error) {
                logger.error('Error abandoning game:', error);
                await confirmInteraction.update({
                    content: '❌ Erreur lors de l\'abandon de la partie.',
                    embeds: [],
                    components: []
                });
            }
        });

        collector.on('end', async(collected) => {
            if (collected.size === 0) {
                // Timeout - pas de réponse
                try {
                    await interaction.editReply({
                        content: '⏰ Temps écoulé - Abandon annulé.',
                        embeds: [],
                        components: []
                    });
                } catch (error) {
                    logger.error('Error updating interaction on timeout:', error);
                }
            }
        });

    } catch (error) {
        logger.error('Error handling abandon button:', error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ Impossible d\'abandonner la partie pour le moment.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}
