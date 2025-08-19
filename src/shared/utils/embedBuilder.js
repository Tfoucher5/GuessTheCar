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
 * Crée un embed de victoire (version améliorée avec nouveau système de points)
 */
    static createWinEmbed(score, timeSpent, attempts, car = null) {
        // Si on reçoit un score amélioré (nouveau système)
        if (score && score.achievements && score.bonuses) {
            const display = this.formatEnhancedScoreDisplay(score);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(display.title)
                .setDescription(display.description);

            display.fields.forEach(field => {
                embed.addFields(field);
            });

            return embed.setTimestamp();
        }

        // Fallback vers l'ancien système si pas de score amélioré
        const difficultyText = car ? car.getDifficultyText() :
            (score.difficultyName || score.difficulty || 'Inconnue');

        const carName = car ? car.getFullName() :
            (score.carName || 'Voiture inconnue');

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 Félicitations !')
            .setDescription(`Vous avez trouvé la **${carName}** !`)
            .addFields(
                {
                    name: '🚗 Voiture',
                    value: `**${carName}**`,
                    inline: false
                },
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
                    name: '📊 Difficulté',
                    value: difficultyText,
                    inline: true
                },
                {
                    name: score.isFullSuccess ? '🌟 Réussite complète' : '⭐ Réussite partielle',
                    value: score.isFullSuccess
                        ? 'Point complet obtenu !'
                        : 'Demi-point obtenu',
                    inline: false
                },
                {
                    name: '🏆 Points gagnés',
                    value: `**${(score.basePoints + score.difficultyPoints).toFixed(1)} points totaux**\n` +
                        `*Points de base: ${score.basePoints.toFixed(1)} + Bonus difficulté: ${score.difficultyPoints.toFixed(1)}*`,
                    inline: false
                }
            )
            .setTimestamp();

        return embed;
    }

    /**
     * Formate l'affichage du score amélioré
     */
    static formatEnhancedScoreDisplay(score) {
        let display = {
            title: '',
            description: '',
            fields: []
        };

        // Titre selon les achievements
        if (score.achievements.includes('👑 MAÎTRE ABSOLU')) {
            display.title = '👑 PERFORMANCE LÉGENDAIRE !';
        } else if (score.achievements.length >= 3) {
            display.title = '🌟 PERFORMANCE EXCEPTIONNELLE !';
        } else if (score.achievements.length >= 2) {
            display.title = '⭐ EXCELLENTE PERFORMANCE !';
        } else if (score.achievements.length >= 1) {
            display.title = '🎯 BELLE PERFORMANCE !';
        } else {
            display.title = '🎉 Félicitations !';
        }

        // Description principale
        display.description = `Vous avez trouvé la **${score.details.carName}** !\n`;
        display.description += `**Points totaux:** ${score.totalPoints}`;

        // Achievements
        if (score.achievements.length > 0) {
            display.fields.push({
                name: '🏆 Exploits Débloqués',
                value: score.achievements.join('\n'),
                inline: false
            });
        }

        // Détails des bonus
        if (Object.keys(score.bonuses).length > 0) {
            let bonusText = '';
            Object.values(score.bonuses).forEach(bonus => {
                if (bonus.name) {
                    bonusText += `**${bonus.name}**: ${bonus.description} (x${bonus.multiplier})\n`;
                }
            });

            if (bonusText) {
                display.fields.push({
                    name: '💎 Bonus Obtenus',
                    value: bonusText,
                    inline: false
                });
            }
        }

        // Stats de performance
        display.fields.push({
            name: '📊 Performance',
            value: `**Temps:** ${score.details.timeSpent}s\n**Essais:** ${score.details.totalAttempts}\n**Difficulté:** ${score.details.difficulty}`,
            inline: true
        });

        // Points de base
        display.fields.push({
            name: '🎯 Détail des Points',
            value: `**Base:** ${score.basePoints}\n**Total avec bonus:** ${score.totalPoints}`,
            inline: true
        });

        return display;
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
                '• Points de base: 1 point complet, 0.5 point partiel\n' +
                '• Bonus difficulté: facile (x1), moyen (x1.5), difficile (x2)\n' +
                '• Classement basé sur les points totaux (base + bonus)\n\n' +

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
        const pointsMessage = score ?
            `\nVous gagnez ${(score.basePoints + score.difficultyPoints).toFixed(1)} points totaux (${score.basePoints.toFixed(1)} + ${score.difficultyPoints.toFixed(1)} bonus) pour avoir trouvé la marque.` : '';
        return this.createGameEmbed(gameState, {
            color: '#FFA500',
            title: '🏳️ Partie abandonnée',
            description: `La voiture était la **${correctAnswer}**${pointsMessage}` // Changé ici
        });
    }

    /**
 * Crée un embed de timeout
 */
    static createTimeoutEmbed(gameState, correctAnswer, score = null) {
        const pointsMessage = score ?
            `\nVous gagnez ${(score.basePoints + score.difficultyPoints).toFixed(1)} points totaux (${score.basePoints.toFixed(1)} + ${score.difficultyPoints.toFixed(1)} bonus) pour avoir trouvé la marque.` : '';

        return this.createGameEmbed(gameState, {
            color: '#FF8C00',
            title: '⏰ Temps écoulé',
            description: `La partie a été abandonnée après 5 minutes d'inactivité.\nLa voiture était la **${correctAnswer}**${pointsMessage}` // Changé ici
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
        const country = car.country || 'Inconnu';

        return this.createGameEmbed(gameState, {
            title: `🚗 Nouvelle partie - Difficulté: **${difficultyText}**`,
            description: 'C\'est parti ! Devine la **marque** de la voiture.\n\n' +
                `🌍 **Pays d'origine:** ${country}\n\n` +
                '• Tape `!indice` pour obtenir des indices\n' +
                '• Tape `!change` pour changer de voiture (3 fois max)\n' +
                '• Tape `!terminer` pour mettre fin à la partie\n' +
                '• Tu as 10 essais maximum !\n\n' +
                'La partie se termine automatiquement après 5 minutes d\'inactivité'
        });
    }

    /**
     * Crée un embed pour les résultats de game over
     */
    static createGameOverEmbed(gameState, carName, score = null, timeSpent = 0, attempts = 0) {
        let description = `😞 Dommage !\nLa voiture était la **${carName}**.`;

        if (score && (score.basePoints > 0 || score.difficultyPoints > 0)) {
            const totalPoints = score.basePoints + score.difficultyPoints;
            description += `\n\nVous avez trouvé la marque, vous gagnez ${totalPoints.toFixed(1)} points totaux (${score.basePoints.toFixed(1)} + ${score.difficultyPoints.toFixed(1)} bonus) !`;
        } else {
            description += '\n\nAucun point cette fois, mais essayez encore !';
        }

        const embed = this.createGameEmbed(gameState, {
            color: '#FFA500',
            title: '⌛ Partie terminée',
            description: description
        });

        // Ajouter des champs supplémentaires si disponibles
        if (timeSpent > 0) {
            embed.addFields({
                name: '⏱️ Temps de jeu',
                value: `${(timeSpent / 1000).toFixed(1)} secondes`,
                inline: true
            });
        }

        if (attempts > 0) {
            embed.addFields({
                name: '🎯 Essais utilisés',
                value: `${attempts}`,
                inline: true
            });
        }

        return embed;
    }
}

module.exports = GameEmbedBuilder;
