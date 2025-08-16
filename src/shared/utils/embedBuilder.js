const { EmbedBuilder } = require('discord.js');

class GameEmbedBuilder {
    /**
     * Crée un embed de jeu général
     */
    static createGameEmbed(gameState, options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || '#00FF00')
            .setTitle(options.title || 'Guess The Car')
            .setDescription(options.description || '');

        if (gameState) {
            const footerText = `Partie de ${gameState.username} | Essais: ${gameState.attempts}/10`;
            embed.setFooter({
                text: options.footer ? `${footerText} | ${options.footer}` : footerText
            });
        }

        if (options.fields) {
            embed.addFields(options.fields);
        }

        if (options.thumbnail) {
            embed.setThumbnail(options.thumbnail);
        }

        if (options.timestamp !== false) {
            embed.setTimestamp();
        }

        return embed;
    }

    /**
     * Crée un embed de victoire
     */
    static createWinEmbed(score, timeSpent, attempts) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 Félicitations !')
            .setDescription('Vous avez trouvé la voiture !')
            .addFields(
                {
                    name: '⏱️ Temps',
                    value: `${(timeSpent / 1000).toFixed(1)} secondes`,
                    inline: true
                },
                {
                    name: '🎯 Nombre d\'essais',
                    value: `${attempts}`,
                    inline: true
                },
                {
                    name: score.isFullSuccess ? '🌟 Réussite complète' : '⭐ Réussite partielle',
                    value: score.isFullSuccess
                        ? 'Point complet obtenu !'
                        : 'Demi-point obtenu (marque trouvée avec aide)',
                    inline: true
                },
                {
                    name: '🏆 Points gagnés',
                    value: `${Number(score.difficultyPoints || 0).toFixed(1)} points (difficulté: ${score.difficultyText})`,
                    inline: false
                }
            )
            .setTimestamp();

        return embed;
    }

    /**
     * Crée un embed d'erreur
     */
    static createErrorEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    /**
     * Crée un embed d'information
     */
    static createInfoEmbed(title, description, color = '#4169E1') {
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    /**
     * Crée un embed de classement avec protection complète
     */
    static createLeaderboardEmbed(players) {
        if (players.length === 0) {
            return this.createInfoEmbed(
                '🏆 Classement des meilleurs joueurs',
                'Aucun joueur n\'a encore marqué de points !',
                '#FFD700'
            );
        }

        const leaderboardText = players.map((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮';

            // Protection complète avec Number() pour tous les calculs
            const avgAttempts = Number(player.averageAttempts || 0).toFixed(1);
            const bestTime = player.bestTimeFormatted || 'N/A';
            const totalDifficultyPoints = Number(player.totalDifficultyPoints || 0).toFixed(1);
            const carsGuessed = player.carsGuessed || 0;
            const partialGuesses = player.partialGuesses || 0;

            return `${medal} **${index + 1}.** ${player.username}\n` +
                `Points: ${totalDifficultyPoints} ` +
                `(${carsGuessed} complètes + ${partialGuesses} partielles)\n` +
                `Moyenne: ${avgAttempts} essais | Meilleur temps: ${bestTime}\n`;
        }).join('\n');

        return new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Classement des meilleurs joueurs')
            .setDescription(leaderboardText)
            .setTimestamp();
    }

    /**
     * Crée un embed de statistiques personnelles avec protection complète
     */
    static createStatsEmbed(player) {
        const embed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle(`📊 Statistiques de ${player.username}`)
            .addFields(
                {
                    name: '🏆 Score total',
                    value: `${Number(player.totalDifficultyPoints || 0).toFixed(1)} points`,
                    inline: true
                },
                {
                    name: '✨ Points de base',
                    value: `${Number(player.totalPoints || 0).toFixed(1)} points`,
                    inline: true
                },
                {
                    name: '🎯 Rang',
                    value: player.rank || 'Non classé',
                    inline: true
                },
                {
                    name: '🌟 Réussites complètes',
                    value: `${player.carsGuessed || 0}`,
                    inline: true
                },
                {
                    name: '⭐ Réussites partielles',
                    value: `${player.partialGuesses || 0}`,
                    inline: true
                },
                {
                    name: '📈 Taux de réussite',
                    value: `${Number(player.successRate || 0).toFixed(1)}%`,
                    inline: true
                },
                {
                    name: '🎯 Moyenne d\'essais',
                    value: `${Number(player.averageAttempts || 0).toFixed(1)}`,
                    inline: true
                },
                {
                    name: '⚡ Meilleur temps',
                    value: player.bestTimeFormatted || 'N/A',
                    inline: true
                },
                {
                    name: '🎮 Total parties',
                    value: `${player.totalGames || 0}`,
                    inline: true
                }
            )
            .setTimestamp();

        return embed;
    }

    /**
     * Crée un embed d'aide
     */
    static createHelpEmbed() {
        return new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle('📖 Aide - Guess The Car')
            .setDescription(
                '**🎮 Déroulement**\n' +
                '1. Devinez d\'abord la marque de la voiture\n' +
                '2. Puis devinez le modèle\n' +
                '3. Vous avez 10 essais pour chaque étape\n\n' +

                '**📝 Points**\n' +
                '• 1 point pour une réussite complète\n' +
                '• 0.5 point si vous trouvez avec aide ou uniquement la marque\n' +
                '• Bonus selon la difficulté (facile: x1, moyen: x1.5, difficile: x2)\n\n' +

                '**⌨️ Commandes**\n' +
                '`/guesscar` - Démarrer une nouvelle partie\n' +
                '`/abandon` - Abandonner la partie en cours\n' +
                '`/classement` - Voir le classement\n' +
                '`/stats` - Voir vos statistiques\n' +
                '`/aide` - Afficher cette aide\n\n' +

                '**🎮 Pendant la partie**\n' +
                '`!indice` - Obtenir un indice\n' +
                '`!change` - Changer de voiture (3 fois max)\n' +
                '`!terminer` - Mettre fin à la partie\n\n' +

                '**⏰ Timeout**\n' +
                'Une partie est automatiquement abandonnée après 5 minutes d\'inactivité'
            )
            .setTimestamp();
    }

    /**
     * Crée un embed d'abandon de partie
     */
    static createAbandonEmbed(gameState, correctAnswer, score = null) {
        const pointsMessage = score ? `\nVous gagnez ${Number(score.difficultyPoints || 0).toFixed(1)} points pour avoir trouvé la marque.` : '';

        return this.createGameEmbed(gameState, {
            color: '#FFA500',
            title: '🏳️ Partie abandonnée',
            description: `La voiture était : ${correctAnswer}${pointsMessage}`
        });
    }

    /**
     * Crée un embed de timeout
     */
    static createTimeoutEmbed(gameState, correctAnswer, score = null) {
        const pointsMessage = score ? `\nVous gagnez ${Number(score.difficultyPoints || 0).toFixed(1)} points pour avoir trouvé la marque.` : '';

        return this.createGameEmbed(gameState, {
            color: '#FF8C00',
            title: '⏰ Temps écoulé',
            description: `La partie a été abandonnée après 5 minutes d'inactivité.\nLa voiture était: ${correctAnswer}${pointsMessage}`
        });
    }

    /**
     * Crée un embed de succès
     */
    static createSuccessEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    /**
     * Crée un embed d'avertissement
     */
    static createWarningEmbed(title, description) {
        return new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    /**
     * Crée un embed de démarrage de partie
     */
    static createGameStartEmbed(car, gameState) {
        const difficultyText = car.getDifficultyText();

        return this.createGameEmbed(gameState, {
            title: `🚗 Nouvelle partie - Difficulté: **${difficultyText}**`,
            description: 'C\'est parti ! Devine la **marque** de la voiture.\n\n' +
                '• Tape `!indice` pour obtenir des indices\n' +
                '• Tape `!change` pour changer de voiture (3 fois max)\n' +
                '• Tape `!terminer` pour mettre fin à la partie\n' +
                '• Tu as 10 essais maximum !\n\n' +
                'La partie se termine automatiquement après 5 minutes d\'inactivité'
        });
    }
}

module.exports = GameEmbedBuilder;
