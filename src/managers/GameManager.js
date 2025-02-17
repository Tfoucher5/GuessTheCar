// src/managers/GameManager.js
const Game = require('../models/Game');
const CarApiService = require('../services/CarApiService');
const GameEmbedBuilder = require('../utils/EmbedBuilder');
const { ChannelType } = require('discord.js');

// Fonction pour calculer la distance de Levenshtein
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1,  // substitution
                    dp[i - 1][j] + 1,      // suppression
                    dp[i][j - 1] + 1       // insertion
                );
            }
        }
    }

    return dp[m][n];
}

// Fonction pour calculer le pourcentage de similarité
function calculateSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    const distance = levenshteinDistance(str1, str2);
    return ((maxLength - distance) / maxLength) * 100;
}

// Fonction modifiée pour gérer la vérification des réponses
function checkAnswer(userAnswer, correctAnswer) {
    const similarity = calculateSimilarity(userAnswer.toLowerCase(), correctAnswer.toLowerCase());

    if (similarity >= 75) {
        return {
            isCorrect: true,
            feedback: "Correct ! La réponse était légèrement différente mais suffisamment proche."
        };
    } else if (similarity >= 50) {
        return {
            isCorrect: false,
            feedback: "Presque ! Tu es sur la bonne voie."
        };
    } else {
        return {
            isCorrect: false,
            feedback: "Pas tout à fait, continue à chercher !"
        };
    }
}

class GameManager {
    constructor(client, scoreManager) {
        this.client = client;
        this.scoreManager = scoreManager;
        this.activeGames = new Map();
        this.GAME_TIMEOUT = 300000; // 5 minutes
        this.THREAD_CLOSE_DELAY = 60000; // 1 minute
    }

    async handleCommand(interaction) {
        const { commandName, user } = interaction;

        switch (commandName) {
            case 'guesscar':
                await this.handleGuessCarCommand(interaction);
                break;
            case 'abandon':
                await this.handleAbandonCommand(interaction);
                break;
            case 'classement':
                await this.handleLeaderboardCommand(interaction);
                break;
            case 'stats':
                await this.handleStatsCommand(interaction);
                break;
            case 'aide':
                await this.handleHelpCommand(interaction);
                break;
        }
    }

    async handleMessage(message) {
        const game = this.activeGames.get(message.channelId);
        if (!game || game.userId !== message.author.id) return;

        // Réinitialiser le timeout
        clearTimeout(game.timeoutId);
        game.timeoutId = setTimeout(() => this.handleGameTimeout(message.channelId, game), this.GAME_TIMEOUT);

        const userAnswer = message.content.toLowerCase().trim();

        if (userAnswer === '!indice') {
            await this.handleHintRequest(message, game);
            return;
        }

        game.incrementAttempts();

        if (game.step === 'make') {
            await this.handleMakeGuess(message, game);
        } else {
            await this.handleModelGuess(message, game);
        }
    }

    async handleGuessCarCommand(interaction) {
        const existingGame = Array.from(this.activeGames.values())
            .find(game => game.userId === interaction.user.id);

        if (existingGame) {
            const embed = GameEmbedBuilder.createGameEmbed(existingGame, {
                color: '#FF0000',
                title: '❌ Partie déjà en cours',
                description: 'Vous avez déjà une partie en cours dans un autre fil !'
            });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        try {
            console.log("Début de la gestion de la commande");

            // Répondre immédiatement pour éviter le timeout
            await interaction.deferReply({ ephemeral: true });
            console.log("Réponse différée envoyée");

            // Récupération des données de la voiture
            const car = await CarApiService.getRandomCar();
            if (!car) {
                console.log("Erreur de récupération de la voiture");
                const errorEmbed = GameEmbedBuilder.createGameEmbed(null, {
                    color: '#FF0000',
                    title: '❌ Erreur',
                    description: 'Désolé, une erreur est survenue lors de la récupération de la voiture. Réessayez !'
                });
                await interaction.followUp({ embeds: [errorEmbed] });
                return;
            }

            console.log("Voiture récupérée :", car);

            // Création du thread pour la partie
            const thread = await interaction.channel.threads.create({
                name: `🚗 Partie de ${interaction.user.username}`,
                type: ChannelType.PublicThread,
                autoArchiveDuration: 60
            });

            console.log("Thread créé :", thread);

            // Création du jeu
            const game = new Game(car, interaction.user.id, interaction.user.username, thread.id);
            game.timeoutId = setTimeout(() => this.handleGameTimeout(thread.id, game), this.GAME_TIMEOUT);

            this.activeGames.set(thread.id, game);

            // Création de l'embed de démarrage
            const gameStartEmbed = GameEmbedBuilder.createGameEmbed(game, {
                title: '🚗 Nouvelle partie',
                description: 'C\'est parti ! Devine la **marque** de la voiture.\nTape `!indice` pour obtenir des indices.\nTu as 10 essais maximum !',
                footer: 'La partie se termine automatiquement après 5 minutes d\'inactivité'
            });

            console.log("Embed de démarrage créé");

            // Envoi de l'embed dans le thread
            await thread.send({ embeds: [gameStartEmbed] });
            console.log("Embed envoyé dans le thread");

            // Réponse à l'utilisateur pour lui indiquer que la partie a été créée
            await interaction.followUp(`Partie créée ! Rendez-vous dans ${thread}`);
            console.log("Réponse finale envoyée");

        } catch (error) {
            console.error("Erreur dans handleGuessCarCommand:");
            await interaction.followUp({
                content: 'Une erreur est survenue, veuillez réessayer plus tard.',
                ephemeral: true
            });
        }
    }

    async handleAbandonCommand(interaction) {
        const userGame = Array.from(this.activeGames.entries())
            .find(([_, game]) => game.userId === interaction.user.id);

        if (!userGame) {
            const embed = GameEmbedBuilder.createGameEmbed(null, {
                color: '#FF0000',
                title: '❌ Aucune partie en cours',
                description: 'Vous n\'avez aucune partie en cours.'
            });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const [threadId, game] = userGame;
        try {
            const thread = await this.client.channels.fetch(threadId);
            if (!thread) {
                this.activeGames.delete(threadId);
                throw new Error('Thread introuvable');
            }

            clearTimeout(game.timeoutId);

            const abandonEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FFA500',
                title: '🏳️ Partie abandonnée',
                description: `La voiture était : ${game.make} ${game.model}`
            });

            await thread.send({ embeds: [abandonEmbed] });
            this.activeGames.delete(threadId);

            await this.handleDelayedThreadClose(thread, game.timeoutId);
        } catch (error) {
            console.error('Erreur lors de l\'abandon:', error);
            const errorEmbed = GameEmbedBuilder.createGameEmbed(null, {
                color: '#FF0000',
                title: '❌ Erreur',
                description: 'Une erreur est survenue lors de l\'abandon de la partie.'
            });
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }

    async handleGameTimeout(threadId, game) {
        const thread = await this.client.channels.fetch(threadId);
        if (thread && this.activeGames.has(threadId)) {
            const timeoutEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '⏰ Temps écoulé',
                description: `La partie a été abandonnée après 5 minutes d'inactivité.\nLa voiture était: ${game.make} ${game.model}`
            });

            await thread.send({ embeds: [timeoutEmbed] });
            this.activeGames.delete(threadId);

            await this.handleDelayedThreadClose(thread, game.timeoutId);
        }
    }

    async handleDelayedThreadClose(thread, timeoutId) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        try {
            const updatedThread = await this.client.channels.fetch(thread.id);
            if (updatedThread) {
                await updatedThread.setLocked(true);

                await updatedThread.send({
                    embeds: [GameEmbedBuilder.createGameEmbed(null, {
                        color: '#808080',
                        title: '🔒 Fermeture du fil',
                        description: 'Ce fil va être supprimé dans 1 minute.'
                    })]
                });

                await new Promise(resolve => setTimeout(resolve, this.THREAD_CLOSE_DELAY));

                const threadToDelete = await this.client.channels.fetch(thread.id);
                if (threadToDelete) {
                    await threadToDelete.delete();
                }
            }
        } catch (error) {
            console.error('Erreur lors de la fermeture et suppression du fil:', error);
        }
    }

    async handleHintRequest(message, game) {
        let hintDescription = game.step === 'make'
            ? `🌍 Pays d'origine: ${game.country}\n📏 La marque contient ${game.makeLength} lettres`
            : `📏 Le modèle contient ${game.modelLength} lettres / chiffres\n📆 Le modèle est de ${game.ModelDate}`;

        const hintEmbed = GameEmbedBuilder.createGameEmbed(game, {
            color: '#FFA500',
            title: '💡 Indice',
            description: hintDescription
        });

        await message.reply({ embeds: [hintEmbed] });
    }

    async handleMakeGuess(message, game) {
        const userAnswer = message.content.toLowerCase().trim();
        let hintMessage = game.attempts === 5 ? `\n💡 La marque commence par "${game.firstLetter}"` : '';

        const result = checkAnswer(userAnswer, game.make);

        if (result.isCorrect) {
            game.step = 'model';
            game.resetAttempts();
            const successEmbed = GameEmbedBuilder.createGameEmbed(game, {
                title: '✅ Marque trouvée !',
                description: `${result.feedback}\nC'est bien ${game.make} !\nMaintenant, devine le **modèle** de cette voiture.`
            });
            await message.reply({ embeds: [successEmbed] });
        } else if (game.attempts >= 10) {
            game.makeFailed = true;
            game.step = 'model';
            game.resetAttempts();
            const failedEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FFA500',
                title: '⌛ Plus d\'essais',
                description: `La marque était: **${game.make}**\nOn passe au modèle !`
            });
            await message.reply({ embeds: [failedEmbed] });
        } else {
            const wrongEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '❌ Mauvaise réponse',
                description: `${result.feedback}\n(${10 - game.attempts} essais restants)${hintMessage}`
            });
            await message.reply({ embeds: [wrongEmbed] });
        }
    }

    async handleModelGuess(message, game) {
        try {
            const userAnswer = message.content.toLowerCase().trim();
            let hintMessage = '';

            if (!game.model) {
                console.error('Model undefined for game:', game);
                throw new Error('Données de jeu invalides');
            }

            if (game.attempts === 5) {
                hintMessage = `\n💡 Le modèle commence par "${game.modelFirstLetter}"`;
            } else if (game.attempts === 7) {
                const lastLetter = game.model[game.model.length - 1];
                hintMessage = `\n💡 Le modèle se termine par "${lastLetter}"`;
            }

            const result = checkAnswer(userAnswer, game.model);

            if (result.isCorrect) {
                await this.handleSuccessfulGuess(message, game);
            } else if (game.attempts >= 10) {
                await this.handleFailedGuess(message, game);
            } else {
                const wrongModelEmbed = GameEmbedBuilder.createGameEmbed(game, {
                    color: '#FF0000',
                    title: '❌ Mauvaise réponse',
                    description: `${result.feedback}\n(${10 - game.attempts} essais restants)${hintMessage}`
                });
                await message.reply({ embeds: [wrongModelEmbed] });
            }
        } catch (error) {
            console.error('Erreur dans handleModelGuess:', error);
            const errorEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '❌ Erreur',
                description: 'Une erreur est survenue lors de la vérification de votre réponse. La partie va être abandonnée.'
            });
            await message.reply({ embeds: [errorEmbed] });

            if (game && game.timeoutId) {
                clearTimeout(game.timeoutId);
            }
            this.activeGames.delete(message.channelId);
        }
    }

    async handleSuccessfulGuess(message, game) {
        const timeSpent = game.getTimeSpent();
        const fullSuccess = !game.makeFailed;

        this.scoreManager.updateScore(message.author.id, message.author.username, fullSuccess);
        this.scoreManager.updateGameStats(message.author.id, game.attempts, timeSpent);

        const userScore = this.scoreManager.getUserStats(message.author.id);
        const totalScore = userScore.calculateTotalScore();

        const winEmbed = GameEmbedBuilder.createWinEmbed(game, timeSpent, fullSuccess, totalScore);

        clearTimeout(game.timeoutId);
        await message.reply({ embeds: [winEmbed] });
        this.activeGames.delete(message.channelId);

        await this.handleDelayedThreadClose(message.channel, game.timeoutId);
    }

    async handleFailedGuess(message, game) {
        const timeSpent = game.getTimeSpent();
        this.scoreManager.updateScore(message.author.id, message.author.username, false);
        this.scoreManager.updateGameStats(message.author.id, game.attempts, timeSpent);

        const gameOverEmbed = GameEmbedBuilder.createGameEmbed(game, {
            color: '#FFA500',
            title: '⌛ Plus d\'essais',
            description: `Le modèle était: **${game.model}**\nVous gagnez un demi-point pour avoir trouvé la marque.`
        });

        clearTimeout(game.timeoutId);
        await message.reply({ embeds: [gameOverEmbed] });
        this.activeGames.delete(message.channelId);

        await this.handleDelayedThreadClose(message.channel, game.timeoutId);
    }

    async handleLeaderboardCommand(interaction) {
        const leaderboard = this.scoreManager.getLeaderboard();

        if (leaderboard.length === 0) {
            const embed = GameEmbedBuilder.createGameEmbed(null, {
                color: '#FFD700',
                title: '🏆 Classement des meilleurs joueurs',
                description: 'Aucun joueur n\'a encore marqué de points !'
            });
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const leaderboardText = leaderboard.map((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮';
            const avgAttempts = player.averageAttempts.toFixed(1);
            const bestTime = player.bestTime ? `${(player.bestTime / 1000).toFixed(1)}s` : 'N/A';

            return `${medal} **${index + 1}.** ${player.username}\n` +
                `Points: ${player.totalScore.toFixed(1)} (${player.carsGuessed} complètes + ${player.partialGuesses} partielles)\n` +
                `Moyenne: ${avgAttempts} essais | Meilleur temps: ${bestTime}\n`;
        }).join('\n');

        const leaderboardEmbed = GameEmbedBuilder.createGameEmbed(null, {
            color: '#FFD700',
            title: '🏆 Classement des meilleurs joueurs',
            description: leaderboardText || 'Aucun joueur n\'a encore marqué de points !'
        });

        await interaction.reply({ embeds: [leaderboardEmbed] });
    }

    async handleStatsCommand(interaction) {
        // Force le rechargement des scores avant de vérifier les stats
        await this.scoreManager.loadScores();

        const stats = this.scoreManager.getUserStats(interaction.user.id);
        if (!stats || (stats.carsGuessed === 0 && stats.partialGuesses === 0)) {
            const embed = GameEmbedBuilder.createGameEmbed(null, {
                color: '#FF0000',
                title: '❌ Aucune statistique',
                description: 'Vous n\'avez pas encore joué !'
            });
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const totalScore = stats.calculateTotalScore();
        const avgAttempts = stats.averageAttempts;
        const bestTime = stats.bestTime ? `${(stats.bestTime / 1000).toFixed(1)} secondes` : 'N/A';

        const statsEmbed = GameEmbedBuilder.createGameEmbed(null, {
            color: '#4169E1',
            title: `📊 Statistiques de ${interaction.user.username}`,
            description:
                `🏆 Score total: ${totalScore.toFixed(1)} points\n` +
                `✨ Réussites complètes: ${stats.carsGuessed}\n` +
                `⭐ Réussites partielles: ${stats.partialGuesses}\n` +
                `🎯 Moyenne d'essais: ${avgAttempts.toFixed(1)}\n` +
                `⚡ Meilleur temps: ${bestTime}`
        });

        await interaction.reply({ embeds: [statsEmbed] });
    }

    async handleHelpCommand(interaction) {
        const helpEmbed = GameEmbedBuilder.createGameEmbed(null, {
            color: '#4169E1',
            title: '📖 Aide - Guess The Car',
            description:
                '**🎮 Déroulement**\n' +
                '1. Devinez d\'abord la marque de la voiture\n' +
                '2. Puis devinez le modèle\n' +
                '3. Vous avez 10 essais pour chaque étape\n\n' +
                '**📝 Points**\n' +
                '• 1 point pour une réussite complète\n' +
                '• 0.5 point si vous trouvez avec aide ou uniquement la marque\n\n' +
                '**⌨️ Commandes**\n' +
                '`/guesscar` - Démarrer une nouvelle partie\n' +
                '`/abandon` - Abandonner la partie en cours\n' +
                '`/classement` - Voir le classement\n' +
                '`/stats` - Voir vos statistiques\n' +
                '`!indice` - Obtenir un indice pendant la partie\n\n' +
                '**⏰ Timeout**\n' +
                'Une partie est automatiquement abandonnée après 5 minutes d\'inactivité'
        });

        await interaction.reply({ embeds: [helpEmbed] });
    }
}

module.exports = GameManager;