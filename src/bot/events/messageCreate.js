const { Events } = require('discord.js');
const GameEngine = require('../../core/game/GameEngine');
const EmbedBuilder = require('../../bot/utils/embedBuilder');
const logger = require('../../shared/utils/logger');

// Instance globale du moteur de jeu
const gameEngine = new GameEngine();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignorer les messages des bots
        if (message.author.bot) return;

        // Vérifier s'il y a une partie active dans ce thread
        const activeGame = gameEngine.getActiveGame(message.channelId);
        if (!activeGame || activeGame.userId !== message.author.id) return;

        try {
            // Traiter la réponse du joueur
            const result = await gameEngine.processGuess(message.channelId, message.content);
            await handleGameResult(message, result, activeGame);

        } catch (error) {
            logger.error('Error processing message in game:', {
                channelId: message.channelId,
                userId: message.author.id,
                error: error.message
            });

            const errorEmbed = EmbedBuilder.createErrorEmbed(
                'Erreur',
                'Une erreur est survenue lors du traitement de votre réponse.'
            );

            await message.reply({ embeds: [errorEmbed] });
        }
    }
};

/**
 * Gère le résultat d'une réponse de jeu - Maintenant avec boutons mis à jour
 */
async function handleGameResult(message, result, gameState) {
    let embedResponse;
    let shouldCloseThread = false;

    switch (result.type) {
    case 'makeSuccess': {
        embedResponse = EmbedBuilder.createGameEmbedWithButtons(gameState, {
            title: '✅ Marque trouvée !',
            description: result.feedback
        });
        break;
    }

    case 'makeFailed': {
        embedResponse = EmbedBuilder.createGameEmbedWithButtons(gameState, {
            color: '#FFA500',
            title: '⌛ Plus d\'essais pour la marque',
            description: result.feedback
        });
        break;
    }

    case 'gameComplete': {
        // Utiliser l'embed de victoire sans boutons (partie finie)
        const winEmbed = EmbedBuilder.createWinEmbed(
            result.score,
            result.timeSpent,
            result.attempts,
            result.car
        );
        embedResponse = { embeds: [winEmbed] }; // Pas de boutons pour une partie terminée
        shouldCloseThread = true;
        break;
    }

    case 'gameOver':
    // Game over sans boutons
    { let gameOverEmbed;
        if (result.car) {
            gameOverEmbed = EmbedBuilder.createGameOverEmbed(
                gameState,
                result.car.getFullName(),
                result.score,
                result.timeSpent,
                result.attempts
            );
        } else {
            gameOverEmbed = EmbedBuilder.createGameEmbed(gameState, {
                color: '#FFA500',
                title: '⌛ Partie terminée',
                description: result.feedback
            });
        }
        embedResponse = { embeds: [gameOverEmbed] }; // Pas de boutons
        shouldCloseThread = true;
        break; }

    case 'incorrect':
    default:
        // Mauvaise réponse - garde les boutons actifs
        embedResponse = EmbedBuilder.createGameEmbedWithButtons(gameState, {
            color: '#FF0000',
            title: '❌ Mauvaise réponse',
            description: result.feedback
        });
        break;

    case 'validation_error':
    // Erreur de validation - garde les boutons actifs
    { const warningEmbed = EmbedBuilder.createWarningEmbed(
        'Caractères non autorisés',
        result.feedback
    );
    embedResponse = {
        embeds: [warningEmbed],
        components: [EmbedBuilder.updateGameButtons(gameState)]
    };
    break; }
    }

    await message.reply(embedResponse);

    // Fermer le thread si la partie est terminée
    if (shouldCloseThread) {
        setTimeout(async() => {
            try {
                if (message.channel.isThread()) {
                    const closeEmbed = EmbedBuilder.createInfoEmbed(
                        '🔒 Fermeture du fil',
                        'Ce fil va être supprimé dans 1 minute.'
                    );

                    await message.channel.send({ embeds: [closeEmbed] });
                    await message.channel.setLocked(true);

                    setTimeout(async() => {
                        try {
                            await message.channel.delete();
                        } catch (error) {
                            logger.error('Error deleting thread:', error);
                        }
                    }, 60000);
                }
            } catch (error) {
                logger.error('Error closing thread:', error);
            }
        }, 5000);
    }
}

// Exporter le gameEngine pour l'utiliser dans les commandes
module.exports.gameEngine = gameEngine;
