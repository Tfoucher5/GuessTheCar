// src/bot/commands/game/guesscar.js - Version mise à jour avec boutons et mention

const { SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js');
const GameEngineManager = require('../../../core/game/GameEngineManager');
const EmbedBuilder = require('../../utils/embedBuilder');
const logger = require('../../../shared/utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guesscar')
        .setDescription('Démarre une nouvelle partie de devine la voiture'),

    async execute(interaction) {
        try {
            logger.debug('Starting guesscar command execution', { userId: interaction.user.id });

            // Différer la réponse IMMÉDIATEMENT, avant toute autre opération
            // Cela évite les problèmes de timing avec Discord
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    logger.debug('Reply deferred successfully', { userId: interaction.user.id });
                }
            } catch (deferError) {
                // Si l'interaction est déjà acknowledgée, on continue quand même
                // mais on ne pourra pas répondre normalement
                logger.warn('Failed to defer reply (interaction may be expired or already acknowledged):', {
                    userId: interaction.user.id,
                    error: deferError.message,
                    code: deferError.code
                });

                // Si c'est une erreur "already acknowledged" ou "unknown interaction", on abandonne
                if (deferError.code === 40060 || deferError.code === 10062) {
                    logger.error('Cannot proceed - interaction is invalid', {
                        userId: interaction.user.id,
                        code: deferError.code
                    });
                    return;
                }

                // Pour d'autres erreurs, on tente de continuer
                throw deferError;
            }

            // Récupérer l'instance du GameEngine
            const gameEngine = GameEngineManager.getInstance();

            // Vérifier s'il y a déjà une partie active pour ce joueur
            const existingGame = gameEngine.findActiveGameByUser(interaction.user.id);

            if (existingGame) {
                logger.debug('User already has active game', { userId: interaction.user.id, threadId: existingGame.threadId });
                const errorEmbed = EmbedBuilder.createErrorEmbed(
                    'Partie déjà en cours',
                    `Vous avez déjà une partie en cours dans <#${existingGame.threadId}> !`
                );

                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            // Créer le thread pour la partie
            logger.debug('Creating thread', { userId: interaction.user.id });
            const thread = await interaction.channel.threads.create({
                name: `🚗 Partie de ${interaction.user.username}`,
                type: ChannelType.PrivateThread,
                autoArchiveDuration: 60
            });
            logger.debug('Thread created', { userId: interaction.user.id, threadId: thread.id });

            // Démarrer la partie
            logger.debug('Starting game', { userId: interaction.user.id, threadId: thread.id });
            const gameState = await gameEngine.startGame(
                interaction.user.id,
                interaction.user.username,
                thread.id,
                interaction.guild?.id
            );
            logger.debug('Game started', { userId: interaction.user.id, threadId: thread.id });

            // ✅ MODIFIÉ: Créer l'embed de démarrage avec boutons
            const gameStartResponse = EmbedBuilder.createGameStartEmbed(gameState.car, gameState);

            // Envoyer dans le thread avec les boutons ET la mention
            await thread.send({
                content: `<@${interaction.user.id}>`, // <-- La mention qui ajoute l'utilisateur au fil
                ...gameStartResponse // Réutilise les embeds et boutons de la réponse
            });

            // Répondre à l'utilisateur
            const successEmbed = EmbedBuilder.createSuccessEmbed(
                'Partie créée !',
                `Votre partie a été créée dans ${thread}.\nUtilisez les boutons pour interagir avec le jeu !`
            );

            await interaction.editReply({ embeds: [successEmbed] });

            logger.info('Game started:', {
                car: gameState.car.getFullName(),
                difficulty: gameState.car.getDifficultyText(),
                threadId: thread.id,
                userId: interaction.user.id,
                username: interaction.user.username
            });


        } catch (error) {
            logger.error('Error in guesscar command:', {
                userId: interaction.user.id,
                error: error.message,
                stack: error.stack,
                interactionState: {
                    replied: interaction.replied,
                    deferred: interaction.deferred
                }
            });

            // Essayer de répondre à l'utilisateur avec l'erreur
            try {
                const errorEmbed = EmbedBuilder.createErrorEmbed(
                    'Erreur',
                    'Impossible de créer une partie pour le moment. Veuillez réessayer.'
                );

                // Comme on a defer au début, on devrait toujours pouvoir utiliser editReply
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ embeds: [errorEmbed] });
                } else if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                } else {
                    logger.warn('Cannot send error message - interaction already handled', {
                        userId: interaction.user.id,
                        replied: interaction.replied,
                        deferred: interaction.deferred
                    });
                }
            } catch (replyError) {
                logger.error('Failed to send error message:', {
                    userId: interaction.user.id,
                    error: replyError.message,
                    code: replyError.code
                });
            }
        }
    }
};
