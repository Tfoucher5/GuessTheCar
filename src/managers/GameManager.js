const Game = require('../models/Game');
const CarApiService = require('../services/CarApiService');
const GameEmbedBuilder = require('../utils/EmbedBuilder');
const Verification = require('../utils/Verification');
const { ChannelType } = require('discord.js');


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

        switch (userAnswer) {
            case '!indice':
                await this.handleHintRequest(message, game);
                return;
            case '!change':
                await this.handleCarChange(message, game);
                return;
            case '!terminer':
                await this.handleGameEnd(message, game);
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
                type: ChannelType.PrivateThread,
                autoArchiveDuration: 60
            });

            console.log("Thread créé :", thread);

            // Création du jeu
            const game = new Game(car, interaction.user.id, interaction.user.username, thread.id);
            game.timeoutId = setTimeout(() => this.handleGameTimeout(thread.id, game), this.GAME_TIMEOUT);

            this.activeGames.set(thread.id, game);

            const difficulte = game.modelDifficulte === 3 ? "difficile" :
            game.modelDifficulte === 2 ? "moyen" : game.modelDifficulte === 1 ? "facile" : "erreur";

            // Création de l'embed de démarrage
            const gameStartEmbed = GameEmbedBuilder.createGameEmbed(game, {
                title: `🚗 Nouvelle partie, difficulté : **${difficulte}**\n`,
                description: 'C\'est parti ! Devine la **marque** de la voiture.\nTape `!indice` pour obtenir des indices.\nTape `!change` pour changer de voiture à deviner.\nTape `!terminer` pour mettre fin à la partie.\nTu as 10 essais maximum !\n\n' +
                'La partie se termine automatiquement après 5 minutes d\'inactivité'
            });

            // Envoi de l'embed dans le thread
            await thread.send({ embeds: [gameStartEmbed] });

            // Réponse à l'utilisateur pour lui indiquer que la partie a été créée
            await interaction.followUp(`Partie créée ! Rendez-vous dans ${thread}`);

        } catch (error) {
            console.error(`Erreur dans handleGuessCarCommand: ${error}`);
            await interaction.followUp({
                content: 'Une erreur est survenue, veuillez réessayer plus tard.',
                ephemeral: true
            });
        }
    }

    async handleAbandonCommand(interaction) {
        // D'abord, différer la réponse pour éviter le timeout
        await interaction.deferReply({ ephemeral: true });

        const userGame = Array.from(this.activeGames.entries())
            .find(([_, game]) => game.userId === interaction.user.id);

        if (!userGame) {
            const embed = GameEmbedBuilder.createGameEmbed(null, {
                color: '#FF0000',
                title: '❌ Aucune partie en cours',
                description: 'Vous n\'avez aucune partie en cours.'
            });
            await interaction.editReply({ embeds: [embed] });
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

            // Répondre à l'interaction
            await interaction.editReply({
                content: "Partie abandonnée avec succès",
                ephemeral: true
            });

            await this.handleDelayedThreadClose(thread, game.timeoutId);
        } catch (error) {
            console.error('Erreur lors de l\'abandon:', error);
            const errorEmbed = GameEmbedBuilder.createGameEmbed(null, {
                color: '#FF0000',
                title: '❌ Erreur',
                description: 'Une erreur est survenue lors de l\'abandon de la partie.'
            });
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }

    async handleGameTimeout(threadId, game) {
        const thread = await this.client.channels.fetch(threadId);
        if (thread && this.activeGames.has(threadId)) {
            // Calculer les points si la marque a été trouvée
            let pointsMessage = '';
            if (game.step === 'model') {
                const points = this.calculatePoints(game.modelDifficulte, false);
                this.scoreManager.updateScore(game.userId, game.username, false, points);
                pointsMessage = `\nVous gagnez ${points} points pour avoir trouvé la marque.`;
            }

            const timeoutEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '⏰ Temps écoulé',
                description: `La partie a été abandonnée après 5 minutes d'inactivité.\n` +
                    `La voiture était: ${game.make} ${game.model}${pointsMessage}`
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
            // Vérifier si le thread existe et est accessible
            const updatedThread = await this.client.channels.fetch(thread.id)
                .catch(error => {
                    console.log(`Thread ${thread.id} n'est plus accessible:`, error.message);
                    return null;
                });
            
            if (!updatedThread) {
                console.log(`Thread ${thread.id} n'existe plus ou n'est pas accessible`);
                return;
            }
    
            // Vérifier en détail les permissions nécessaires
            const permissions = updatedThread.permissionsFor(this.client.user);
            const requiredPermissions = ['ManageThreads', 'SendMessages'];
            const missingPermissions = requiredPermissions.filter(perm => !permissions.has(perm));
    
            if (missingPermissions.length > 0) {
                console.log(`Permissions manquantes pour le thread ${thread.id}: ${missingPermissions.join(', ')}`);
                
                // Si on peut au moins envoyer des messages, notifier dans le thread
                if (permissions.has('SendMessages')) {
                    try {
                        await updatedThread.send({
                            embeds: [GameEmbedBuilder.createGameEmbed(null, {
                                color: '#FF0000',
                                title: '⚠️ Permissions insuffisantes',
                                description: 'Le bot ne peut pas fermer ce thread automatiquement. Un administrateur devra le faire manuellement.'
                            })]
                        });
                    } catch (error) {
                        console.log(`Impossible d'envoyer le message d'avertissement:`, error.message);
                    }
                }
                return;
            }
    
            // Tentative de verrouillage avec gestion d'erreur détaillée
            try {
                await updatedThread.setLocked(true);
            } catch (error) {
                console.log(`Erreur lors du verrouillage du thread ${thread.id}:`, error.message);
                return;
            }
    
            // Envoi du message de fermeture
            try {
                await updatedThread.send({
                    embeds: [GameEmbedBuilder.createGameEmbed(null, {
                        color: '#808080',
                        title: '🔒 Fermeture du fil',
                        description: 'Ce fil va être supprimé dans 1 minute.'
                    })]
                });
            } catch (error) {
                console.log(`Erreur lors de l'envoi du message de fermeture:`, error.message);
                return;
            }
    
            // Attendre avant la suppression
            await new Promise(resolve => setTimeout(resolve, this.THREAD_CLOSE_DELAY));
    
            // Dernière tentative de suppression
            try {
                const threadToDelete = await this.client.channels.fetch(thread.id)
                    .catch(() => null);
                    
                if (threadToDelete) {
                    await threadToDelete.delete()
                        .catch(error => {
                            console.log(`Erreur lors de la suppression du thread ${thread.id}:`, error.message);
                            // Notification en cas d'échec de la suppression
                            if (permissions.has('SendMessages')) {
                                threadToDelete.send({
                                    embeds: [GameEmbedBuilder.createGameEmbed(null, {
                                        color: '#FF0000',
                                        title: '⚠️ Erreur de suppression',
                                        description: 'Le fil n\'a pas pu être supprimé automatiquement. Un administrateur devra le faire manuellement.'
                                    })]
                                }).catch(() => {});
                            }
                        });
                }
            } catch (error) {
                console.log(`Erreur finale lors de la gestion du thread ${thread.id}:`, error.message);
            }
        } catch (error) {
            console.log('Erreur générale dans handleDelayedThreadClose:', error.message);
        }
    }

    async handleHintRequest(message, game) {
        let hintDescription = game.step === 'make'
            ? `🌍 Pays d'origine: ${game.country}\n📏 La marque contient ${game.makeLength} lettres`
            : `📏 Le modèle contient ${game.modelLength} lettres / chiffres\n📆 Le modèle est de ${game.modelDate}`;

        const hintEmbed = GameEmbedBuilder.createGameEmbed(game, {
            color: '#FFA500',
            title: '💡 Indice',
            description: hintDescription
        });

        await message.reply({ embeds: [hintEmbed] });
    }

    async handleCarChange(message, game) {
        try {
            // Vérifier si le joueur peut encore changer de voiture
            if (!game.canChangecar() == true) {
                const limitEmbed = GameEmbedBuilder.createGameEmbed(game, {
                    color: '#FF0000',
                    title: '❌ Limite atteinte',
                    description: 'Vous avez déjà utilisé vos 3 changements de voiture pour cette partie.'
                });
                await message.reply({ embeds: [limitEmbed] });
                return;
            }
    
            const newCar = await CarApiService.getRandomCar();
            if (!newCar) {
                const errorEmbed = GameEmbedBuilder.createGameEmbed(game, {
                    color: '#FF0000',
                    title: '❌ Erreur',
                    description: 'Impossible de changer de voiture. Veuillez réessayer.'
                });
                await message.reply({ embeds: [errorEmbed] });
                return;
            }
    
            // Incrémenter le compteur de changements
            game.incrementCarChanges();
    
            // Mise à jour du jeu avec la nouvelle voiture
            game.updateCar(newCar);
            game.step = 'make';
            game.resetAttempts();
            game.makeFailed = false;
    
            const newGameEmbed = GameEmbedBuilder.createGameEmbed(game, {
                title: '🔄 Nouvelle voiture',
                description: `Voiture changée ! Devine la **marque** de la nouvelle voiture.\nTape \`!indice\` pour obtenir des indices.\nTape \`!change\` pour changer encore.\nTape \`!terminer\` pour mettre fin à la partie.\n\n*Changements restants: ${3 - game.carChangesCount}*`
            });
    
            await message.reply({ embeds: [newGameEmbed] });
        } catch (error) {
            console.error('Erreur lors du changement de voiture:', error);
            const errorEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '❌ Erreur',
                description: 'Une erreur est survenue lors du changement de voiture.'
            });
            await message.reply({ embeds: [errorEmbed] });
        }
    }

    async handleGameEnd(message, game) {
        const timeSpent = game.getTimeSpent();
        let points = 0;
        let description = '';
        if (game.step === 'model') {
            points = this.calculatePoints(game.modelDifficulte, false);
            description = `Partie terminée ! Vous gagnez ${points} points pour avoir trouvé la marque.`;
        } else {
            description = 'Partie terminée sans points. Vous n\'avez pas encore trouvé la marque.';
        }
    
        if (points > 0) {
            this.scoreManager.updateScore(message.author.id, message.author.username, true, points);
            this.scoreManager.updateGameStats(message.author.id, game.attempts, timeSpent);
        }
    
        const endEmbed = GameEmbedBuilder.createGameEmbed(game, {
            color: '#4169E1',
            title: '🏁 Fin de partie',
            description: `${description}\nLa voiture était: ${game.make} ${game.model}`
        });
    
        clearTimeout(game.timeoutId);
        await message.reply({ embeds: [endEmbed] });
        this.activeGames.delete(message.channelId);
    
        try {
            const thread = await this.client.channels.fetch(message.channelId);
            if (thread) {
                await this.handleDelayedThreadClose(thread, game.timeoutId);
            }
        } catch (error) {
            console.error('Erreur lors de la fermeture du thread:', error);
        }
    }

    calculatePoints(difficulty, fullSuccess) {
        // Base points
        let points = fullSuccess ? 1 : 0.5;

        // Multiplier based on difficulty (1: Easy, 2: Medium, 3: Hard)
        const multiplier = difficulty === 3 ? 2 :
            difficulty === 2 ? 1.5 :
                1;

        return points * multiplier;
    }

    async handleMakeGuess(message, game) {
        const userAnswer = message.content.toLowerCase().trim();
        let hintMessage = game.attempts === 5 ? `\n💡 La marque commence par "${game.firstLetter}"` : '';

        const result = Verification.checkAnswer(userAnswer, game.make);

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

            const result = Verification.checkAnswer(userAnswer, game.model);

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
        const basePoints = fullSuccess ? 1 : 0.5;
        const difficultyPoints = this.calculatePoints(game.modelDifficulte, fullSuccess);
    
        this.scoreManager.updateScore(
            message.author.id, 
            message.author.username, 
            fullSuccess, 
            basePoints,
            difficultyPoints
        );
        
        this.scoreManager.updateGameStats(message.author.id, game.attempts, timeSpent);
    
        const userScore = this.scoreManager.getUserStats(message.author.id);
        const difficultyText = game.modelDifficulte === 3 ? "difficile" :
            game.modelDifficulte === 2 ? "moyen" : game.modelDifficulte === 1 ? "facile" : "erreur";
    
        const winEmbed = GameEmbedBuilder.createGameEmbed(game, {
            title: '🎉 Victoire !',
            description: `Félicitations ! Vous avez trouvé ${game.make} ${game.model} !\n` +
                `Niveau de difficulté: ${difficultyText}\n` +
                `Points de base : ${basePoints}\n` +
                `Points gagnés grâce au bonus de difficulté: ${difficultyPoints}\n` +
                `Temps: ${(timeSpent / 1000).toFixed(1)} secondes\n`
        });
    
        clearTimeout(game.timeoutId);
        await message.reply({ embeds: [winEmbed] });
        this.activeGames.delete(message.channelId);
    
        try {
            const thread = await this.client.channels.fetch(message.channelId);
            if (thread) {
                await this.handleDelayedThreadClose(thread, game.timeoutId);
            }
        } catch (error) {
            console.error('Erreur lors de la fermeture du thread:', error);
        }
    }

    async handleFailedGuess(message, game) {
        const timeSpent = game.getTimeSpent();
        const points = this.calculatePoints(game.modelDifficulte, false);
    
        this.scoreManager.updateScore(message.author.id, message.author.username, false, points);
        this.scoreManager.updateGameStats(message.author.id, game.attempts, timeSpent);
    
        const difficultyText = game.modelDifficulte === 3 ? "difficile" :
            game.modelDifficulte === 2 ? "moyen" : "facile";
    
        const gameOverEmbed = GameEmbedBuilder.createGameEmbed(game, {
            color: '#FFA500',
            title: '⌛ Plus d\'essais',
            description: `Le modèle était: **${game.model}**\n` +
                `Niveau de difficulté: ${difficultyText}\n` +
                `Vous gagnez ${points} points pour avoir trouvé la marque.`
        });
    
        clearTimeout(game.timeoutId);
        await message.reply({ embeds: [gameOverEmbed] });
        this.activeGames.delete(message.channelId);
    
        try {
            const thread = await this.client.channels.fetch(message.channelId);
            if (thread) {
                await this.handleDelayedThreadClose(thread, game.timeoutId);
            }
        } catch (error) {
            console.error('Erreur lors de la fermeture du thread:', error);
        }
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
            description: leaderboardText
        });

        await interaction.reply({ embeds: [leaderboardEmbed] });
    }

    async handleStatsCommand(interaction) {
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

        const statsEmbed = GameEmbedBuilder.createGameEmbed(null, {
            color: '#4169E1',
            title: `📊 Statistiques de ${interaction.user.username}`,
            description:
                `🏆 Score total: ${stats.totalDifficultyPoints.toFixed(1)} points\n` +
                `✨ Points de base (sans bonus difficulté): ${stats.totalPoints.toFixed(1)}\n` +
                `🌟 Réussites complètes (marque + modèle): ${stats.carsGuessed}\n` +
                `⭐ Réussites partielles: ${stats.partialGuesses}\n` +
                `🎯 Moyenne d'essais: ${stats.averageAttempts.toFixed(1)}\n` +
                `⚡ Meilleur temps: ${stats.bestTime ? `${(stats.bestTime / 1000).toFixed(1)} secondes` : 'N/A'}`
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
                '`!indice` - Obtenir un indice pendant la partie\n' +
                '`!change` - Changer de voiture à deviner pendant la partie\n' +
                '`!terminer` - mettre fin à la partie en cours\n' +
                '**⏰ Timeout**\n' +
                'Une partie est automatiquement abandonnée après 5 minutes d\'inactivité'
        });

        await interaction.reply({ embeds: [helpEmbed] });
    }
}

module.exports = GameManager;