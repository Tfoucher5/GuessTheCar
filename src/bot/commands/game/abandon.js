const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const GameEngineManager = require('../../../core/game/GameEngineManager');
const EmbedBuilder = require('../../utils/embedBuilder');
const logger = require('../../../shared/utils/logger');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('abandon')
        .setDescription('Abandonne la partie en cours'),

    async execute(interaction) {
        try {
            // Récupérer l'instance du GameEngine
            const gameEngine = GameEngineManager.getInstance();

            // Différer la réponse
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Trouver la partie active de l'utilisateur
            const userGame = gameEngine.findActiveGameByUser(interaction.user.id);

            if (!userGame) {
                const errorEmbed = EmbedBuilder.createErrorEmbed(
                    'Aucune partie en cours',
                    'Vous n\'avez aucune partie en cours.'
                );
                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }

            const { threadId, gameState } = userGame;

            // Abandonner la partie
            const result = await gameEngine.abandonGame(threadId);

            // Envoyer le message dans le thread de jeu
            try {
                const thread = await interaction.client.channels.fetch(threadId);
                if (thread) {
                    const abandonEmbed = EmbedBuilder.createAbandonEmbed(
                        gameState,
                        result.correctAnswer,
                        result.score
                    );
                    await thread.send({ embeds: [abandonEmbed] });

                    // Programmer la fermeture du thread
                    setTimeout(async() => {
                        try {
                            await thread.setLocked(true);

                            const closeEmbed = EmbedBuilder.createInfoEmbed(
                                '🔒 Fermeture du fil',
                                'Ce fil va être supprimé dans 1 minute.'
                            );
                            await thread.send({ embeds: [closeEmbed] });

                            setTimeout(async() => {
                                try {
                                    await thread.delete();
                                } catch (error) {
                                    logger.error('Error deleting thread after abandon:', error);
                                }
                            }, 60000);
                        } catch (error) {
                            logger.error('Error closing thread after abandon:', error);
                        }
                    }, 5000);
                }
            } catch (error) {
                logger.error('Error accessing thread for abandon message:', error);
            }

            // Répondre à l'interaction
            const successEmbed = EmbedBuilder.createSuccessEmbed(
                'Partie abandonnée',
                'Votre partie a été abandonnée avec succès.'
            );
            await interaction.editReply({ embeds: [successEmbed] });

            logger.info('Game abandoned via command:', {
                userId: interaction.user.id,
                threadId,
                correctAnswer: result.correctAnswer
            });


        } catch (error) {
            logger.error('Error in abandon command:', {
                userId: interaction.user.id,
                error: error.message
            });

            const errorEmbed = EmbedBuilder.createErrorEmbed(
                'Erreur',
                'Une erreur est survenue lors de l\'abandon de la partie.'
            );

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};
