class ChallengeGame extends Game {
    constructor(car, userId, username, threadId) {
        super(car, userId, username, threadId);
        this.totalTime = 180000; // 3 minutes
        this.startTime = Date.now();
        this.timeRemaining = this.totalTime;
        this.updateInterval = null;
        this.score = 0;
        this.carsGuessed = 0;
        this.skipsRemaining = 3;
        this.currentStreak = 0;
    }

    startTimer() {
        this.updateInterval = setInterval(() => {
            this.timeRemaining = this.totalTime - (Date.now() - this.startTime);
            if (this.timeRemaining <= 0) {
                clearInterval(this.updateInterval);
                return false;
            }
            return true;
        }, 1000);
    }

    stopTimer() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    getTimeRemaining() {
        return Math.max(0, Math.floor(this.timeRemaining / 1000));
    }

    addScore(points) {
        this.score += points;
        this.carsGuessed += 1;
        this.currentStreak += 1;
    }

    useSkip() {
        if (this.skipsRemaining > 0) {
            this.skipsRemaining -= 1;
            this.currentStreak = 0;
            return true;
        }
        return false;
    }

    // Ajout des méthodes dans GameManager
    async handleChallengeCommand(interaction) {
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
            await interaction.deferReply({ ephemeral: true });

            const car = await CarApiService.getRandomCar();
            if (!car) {
                const errorEmbed = GameEmbedBuilder.createGameEmbed(null, {
                    color: '#FF0000',
                    title: '❌ Erreur',
                    description: 'Désolé, une erreur est survenue lors de la récupération de la voiture. Réessayez !'
                });
                await interaction.followUp({ embeds: [errorEmbed] });
                return;
            }

            const thread = await interaction.channel.threads.create({
                name: `🏁 Challenge - ${interaction.user.username}`,
                type: ChannelType.PublicThread,
                autoArchiveDuration: 60
            });

            const game = new ChallengeGame(car, interaction.user.id, interaction.user.username, thread.id);
            game.startTimer();

            this.activeGames.set(thread.id, game);

            const gameStartEmbed = GameEmbedBuilder.createGameEmbed(game, {
                title: '🏁 Mode Challenge',
                description:
                    'Devine le plus de voitures possible en 3 minutes !\n\n' +
                    '📝 **Règles**:\n' +
                    '• Tape la marque puis le modèle (ex: "toyota supra")\n' +
                    '• `!indice` pour voir les indices\n' +
                    `• \`!skip\` pour passer (${game.skipsRemaining} disponibles)\n\n` +
                    '🎯 **Points**:\n' +
                    '• +2 points sans indice\n' +
                    '• +1 point avec indices\n' +
                    '• +1 point bonus tous les 3 véhicules consécutifs\n\n' +
                    `⏱️ Temps restant: ${game.getTimeRemaining()} secondes\n` +
                    '💪 Bonne chance !',
                footer: 'Les indices sont donnés automatiquement après 2 essais'
            });

            await thread.send({ embeds: [gameStartEmbed] });
            await interaction.followUp(`Partie créée ! Rendez-vous dans ${thread}`);

            // Mettre à jour le temps restant toutes les 30 secondes
            const updateTimeMessage = setInterval(async () => {
                if (this.activeGames.has(thread.id)) {
                    const timeRemaining = game.getTimeRemaining();
                    if (timeRemaining <= 0) {
                        clearInterval(updateTimeMessage);
                        await this.handleChallengeTimeout(thread.id, game);
                    } else if (timeRemaining % 30 === 0) {
                        const timeUpdateEmbed = GameEmbedBuilder.createGameEmbed(game, {
                            color: '#FFA500',
                            title: '⏱️ Temps restant',
                            description: `Il reste ${timeRemaining} secondes!\n` +
                                `Score actuel: ${game.score} points (${game.carsGuessed} voitures)`
                        });
                        await thread.send({ embeds: [timeUpdateEmbed] });
                    }
                } else {
                    clearInterval(updateTimeMessage);
                }
            }, 1000);

        } catch (error) {
            console.error("Erreur dans handleChallengeCommand:", error);
            await interaction.followUp({
                content: 'Une erreur est survenue, veuillez réessayer plus tard.',
                ephemeral: true
            });
        }
    }

    async handleChallengeMessage(message, game) {
        if (game.getTimeRemaining() <= 0) {
            await this.handleChallengeTimeout(message.channelId, game);
            return;
        }

        const userAnswer = message.content.toLowerCase().trim();

        if (userAnswer === '!indice') {
            await this.handleChallengeHint(message, game);
            return;
        }

        if (userAnswer === '!skip') {
            await this.handleChallengeSkip(message, game);
            return;
        }

        const [makePart, ...modelParts] = userAnswer.split(' ');
        const modelPart = modelParts.join(' ');

        if (!modelPart) {
            const wrongFormatEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '❌ Format incorrect',
                description: 'Tu dois donner la marque ET le modèle ! (exemple: "toyota supra")\n' +
                    `⏱️ Temps restant: ${game.getTimeRemaining()} secondes`
            });
            await message.reply({ embeds: [wrongFormatEmbed] });
            return;
        }

        game.incrementAttempts();

        const makeResult = Verification.checkAnswer(makePart, game.make);
        const modelResult = Verification.checkAnswer(modelPart, game.model);

        if (makeResult.isCorrect && modelResult.isCorrect) {
            await this.handleChallengeSuccess(message, game);
        } else {
            let hintText = '';
            if (game.attempts === 2) {
                hintText = `\n\n💡 **Indices automatiques:**\n` +
                    `🌍 Pays: ${game.country}\n` +
                    `📏 Marque: ${game.makeLength} lettres\n` +
                    `📏 Modèle: ${game.modelLength} caractères`;
            } else if (game.attempts === 4) {
                hintText = `\n\n💡 La marque commence par "${game.firstLetter}"\n` +
                    `Le modèle commence par "${game.modelFirstLetter}"`;
            }

            const wrongGuessEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '❌ Mauvaise réponse',
                description: `${makeResult.isCorrect ? '✅' : '❌'} Marque: ${makeResult.feedback}\n` +
                    `${modelResult.isCorrect ? '✅' : '❌'} Modèle: ${modelResult.feedback}` +
                    hintText + `\n\n⏱️ Temps restant: ${game.getTimeRemaining()} secondes`
            });
            await message.reply({ embeds: [wrongGuessEmbed] });
        }
    }

    async handleChallengeSuccess(message, game) {
        // Calcul des points (2 sans indice, 1 avec indices)
        const points = game.attempts <= 2 ? 2 : 1;

        // Bonus de série
        const streakBonus = game.currentStreak % 3 === 0 ? 1 : 0;

        game.addScore(points + streakBonus);

        try {
            // Obtenir la prochaine voiture
            const nextCar = await CarApiService.getRandomCar();
            if (!nextCar) {
                throw new Error('Impossible de charger la prochaine voiture');
            }

            // Mettre à jour le jeu avec la nouvelle voiture
            game.make = nextCar.make;
            game.model = nextCar.model;
            game.country = nextCar.country;
            game.makeLength = nextCar.make.length;
            game.modelLength = nextCar.model.length;
            game.firstLetter = nextCar.make[0];
            game.modelFirstLetter = nextCar.model[0];
            game.resetAttempts();

            const successEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#00FF00',
                title: '✅ Voiture trouvée !',
                description:
                    `+${points} points${streakBonus ? ` (+ ${streakBonus} bonus série)` : ''}\n` +
                    `🏆 Score total: ${game.score} points\n` +
                    `🚗 Voitures trouvées: ${game.carsGuessed}\n` +
                    `🔥 Série actuelle: ${game.currentStreak}\n\n` +
                    `⏱️ Temps restant: ${game.getTimeRemaining()} secondes\n\n` +
                    'Prochaine voiture...'
            });

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Erreur lors du chargement de la prochaine voiture:', error);
            await this.handleChallengeTimeout(message.channelId, game);
        }
    }

    async handleChallengeSkip(message, game) {
        if (!game.useSkip()) {
            const noSkipsEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FF0000',
                title: '❌ Plus de passages disponibles',
                description: 'Tu as utilisé tous tes passages !'
            });
            await message.reply({ embeds: [noSkipsEmbed] });
            return;
        }

        try {
            const nextCar = await CarApiService.getRandomCar();
            if (!nextCar) {
                throw new Error('Impossible de charger la prochaine voiture');
            }

            const skipEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#FFA500',
                title: '⏭️ Voiture passée',
                description:
                    `La voiture était: ${game.make} ${game.model}\n\n` +
                    `🎯 Score actuel: ${game.score} points\n` +
                    `⏱️ Temps restant: ${game.getTimeRemaining()} secondes\n` +
                    `⏭️ Passages restants: ${game.skipsRemaining}\n\n` +
                    'Nouvelle voiture...'
            });

            // Mettre à jour le jeu avec la nouvelle voiture
            game.make = nextCar.make;
            game.model = nextCar.model;
            game.country = nextCar.country;
            game.makeLength = nextCar.make.length;
            game.modelLength = nextCar.model.length;
            game.firstLetter = nextCar.make[0];
            game.modelFirstLetter = nextCar.model[0];
            game.resetAttempts();

            await message.reply({ embeds: [skipEmbed] });

        } catch (error) {
            console.error('Erreur lors du skip:', error);
            await this.handleChallengeTimeout(message.channelId, game);
        }
    }

    async handleChallengeHint(message, game) {
        const hintEmbed = GameEmbedBuilder.createGameEmbed(game, {
            color: '#FFA500',
            title: '💡 Indices',
            description:
                `🌍 Pays d'origine: ${game.country}\n` +
                `📏 La marque contient ${game.makeLength} lettres\n` +
                `📏 Le modèle contient ${game.modelLength} caractères\n` +
                `${game.attempts >= 4 ? `💡 La marque commence par "${game.firstLetter}"\n` : ''}` +
                `${game.attempts >= 4 ? `💡 Le modèle commence par "${game.modelFirstLetter}"\n` : ''}\n` +
                `⏱️ Temps restant: ${game.getTimeRemaining()} secondes`
        });

        await message.reply({ embeds: [hintEmbed] });
    }

    async handleChallengeTimeout(threadId, game) {
        const thread = await this.client.channels.fetch(threadId);
        if (thread && this.activeGames.has(threadId)) {
            game.stopTimer();

            // Mettre à jour les stats
            this.scoreManager.updateChallengeScore(game.userId, game.username, game.score, game.carsGuessed);

            const timeoutEmbed = GameEmbedBuilder.createGameEmbed(game, {
                color: '#00FF00',
                title: '🏁 Fin du Challenge !',
                description:
                    `⭐ Score final: ${game.score} points\n` +
                    `🚗 Voitures trouvées: ${game.carsGuessed}\n` +
                    `🎯 Meilleure série: ${game.currentStreak}\n\n` +
                    `La dernière voiture était: ${game.make} ${game.model}`
            });

            await thread.send({ embeds: [timeoutEmbed] });
            this.activeGames.delete(threadId);

            await this.handleDelayedThreadClose(thread, null);
        }
    }
}