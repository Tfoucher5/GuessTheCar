const { Events } = require('discord.js');
const GameEngine = require('../../core/game/GameEngine');
const EmbedBuilder = require('../../shared/utils/embedBuilder');
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
            const userInput = message.content.toLowerCase().trim();

            // Gérer les commandes spéciales pendant le jeu
            switch (userInput) {
            case '!indice':
                await handleHintCommand(message, activeGame);
                return;

            case '!change':
                await handleChangeCommand(message, activeGame);
                return;

            case '!terminer':
                await handleEndCommand(message, activeGame);
                return;
            }

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
 * Gère la commande d'indice
 */
async function handleHintCommand(message, gameState) {
    try {
        const result = gameEngine.getHint(message.channelId);

        const hintEmbed = EmbedBuilder.createGameEmbed(gameState, {
            color: '#FFA500',
            title: '💡 Indice',
            description: result.message
        });

        await message.reply({ embeds: [hintEmbed] });
    } catch (error) {
        logger.error('Error handling hint command:', error);
        await message.reply('Impossible d\'obtenir un indice pour le moment.');
    }
}

/**
 * Gère la commande de changement de voiture
 */
async function handleChangeCommand(message, gameState) {
    try {
        const result = await gameEngine.changeCar(message.channelId);

        const changeEmbed = EmbedBuilder.createGameEmbed(gameState, {
            title: '🔄 Nouvelle voiture',
            description: 'Voiture changée ! Devine la **marque** de la nouvelle voiture.\n\n' +
                `*Changements restants: ${result.changesRemaining}*`
        });

        await message.reply({ embeds: [changeEmbed] });
    } catch (error) {
        logger.error('Error handling change command:', error);

        const errorEmbed = EmbedBuilder.createErrorEmbed(
            'Erreur de changement',
            error.message
        );

        await message.reply({ embeds: [errorEmbed] });
    }
}

/**
 * Gère la commande de fin de partie (!terminer)
 */
async function handleEndCommand(message, gameState) {
    try {
        // Utiliser abandonGame au lieu de endGame pour avoir le même comportement que /abandon
        const result = await gameEngine.abandonGame(message.channelId);

        // Utiliser le même embed que /abandon
        const abandonEmbed = EmbedBuilder.createAbandonEmbed(
            gameState,
            result.correctAnswer,
            result.score
        );

        await message.reply({ embeds: [abandonEmbed] });

        // Fermer le thread après un délai (même que /abandon)
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
                    }, 60000); // 1 minute
                }
            } catch (error) {
                logger.error('Error closing thread:', error);
            }
        }, 5000); // 5 secondes avant de commencer la fermeture

    } catch (error) {
        logger.error('Error handling end command:', error);
        await message.reply('Impossible de terminer la partie pour le moment.');
    }
}

/**
 * Gère le résultat d'une réponse de jeu
 */
async function handleGameResult(message, result, gameState) {
    let embed;
    let shouldCloseThread = false;

    switch (result.type) {
    case 'makeSuccess':
        embed = EmbedBuilder.createGameEmbed(gameState, {
            title: '✅ Marque trouvée !',
            description: result.feedback
        });
        break;

    case 'makeFailed':
        embed = EmbedBuilder.createGameEmbed(gameState, {
            color: '#FFA500',
            title: '⌛ Plus d\'essais pour la marque',
            description: result.feedback
        });
        break;

    case 'gameComplete':
        embed = EmbedBuilder.createWinEmbed(
            result.score,
            result.timeSpent,
            result.attempts
        );
        shouldCloseThread = true;
        break;

    case 'gameOver':
        embed = EmbedBuilder.createGameEmbed(gameState, {
            color: '#FFA500',
            title: '⌛ Partie terminée',
            description: result.feedback
        });
        shouldCloseThread = true;
        break;

    case 'incorrect':
    default:
        embed = EmbedBuilder.createGameEmbed(gameState, {
            color: '#FF0000',
            title: '❌ Mauvaise réponse',
            description: result.feedback
        });
        break;
    }

    await message.reply({ embeds: [embed] });

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
        }, 5000); // 5 secondes avant de commencer la fermeture
    }
}

// Exporter le gameEngine pour l'utiliser dans les commandes
module.exports.gameEngine = gameEngine;
