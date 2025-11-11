// src/shared/utils/EnhancedScoreCalculator.js - Version avec difficultyPoints

class EnhancedScoreCalculator {
    constructor() {
        // Seuils de temps pour les bonus (en secondes)
        this.TIME_THRESHOLDS = {
            LIGHTNING: 20,  // ⚡ Éclair (sous 20s) - très rare
            FAST: 35,       // 🚀 Rapide (20s-35s) - plus rapide que la moyenne
            QUICK: 60,      // ⭐ Efficace (35s-60s) - proche de la moyenne
            NORMAL: 90      // 🎯 Normal (60s-90s) - au-dessus de la moyenne
        };

        // Multiplicateurs de bonus
        this.BONUSES = {
            SPEED: {
                LIGHTNING: 2.0,  // x2.0 pour être ultra-rapide
                FAST: 1.5,       // x1.5 pour être rapide
                QUICK: 1.2,      // x1.2 pour être efficace
                NORMAL: 1.0      // x1.0 aucun bonus
            },
            ATTEMPTS: {
                FIRST_TRY: 2.0,      // x2.0 si trouvé du premier coup
                FEW_ATTEMPTS: 1.5,   // x1.5 si trouvé en 2-3 essais
                DECENT: 1.2,         // x1.2 si trouvé en 4-6 essais
                MANY: 1.0            // x1.0 pour 7+ essais
            },
            NO_HINTS: 1.3,           // x1.3 si aucun indice utilisé
            NO_CHANGES: 1.2,         // x1.2 si aucun changement de voiture
            PERFECT_GAME: 2.5        // x2.5 pour un jeu parfait (toutes conditions)
        };

        // Points de base par difficulté
        this.BASE_POINTS = {
            1: 10,  // Facile
            2: 15,  // Moyen
            3: 25   // Difficile
        };

        // ✅ AJOUTÉ: Points de difficulté par niveau
        this.DIFFICULTY_POINTS = {
            1: 1,   // Facile: +1 point de difficulté
            2: 2,   // Moyen: +2 points de difficulté
            3: 4    // Difficile: +4 points de difficulté
        };
    }

    /**
     * ✅ MODIFIÉ: Calcule le score complet avec basePoints ET difficultyPoints séparés
     */
    calculateEnhancedScore(gameData) {
        const {
            car,
            timeSpent, // en millisecondes
            totalAttempts,
            hintsUsed,
            carChanges,
            isComplete,
            makeFound,
            modelFound
        } = gameData;

        const timeInSeconds = Math.round(timeSpent / 1000);
        const basePoints = this.BASE_POINTS[car.difficulty] || 10;
        const difficultyBase = this.DIFFICULTY_POINTS[car.difficulty] || 1;

        let score = {
            basePoints: 0,
            difficultyPoints: 0,  // ✅ AJOUTÉ
            bonuses: {},
            totalPoints: 0,       // Garde pour compatibilité
            achievements: [],
            details: {}
        };

        // Points de base selon le succès
        if (isComplete && makeFound && modelFound) {
            score.basePoints = basePoints; // Points complets
            score.difficultyPoints = difficultyBase; // ✅ Points de difficulté complets
        } else if (makeFound) {
            score.basePoints = basePoints * 0.5; // Points partiels
            score.difficultyPoints = difficultyBase * 0.5; // ✅ Points de difficulté partiels
        } else {
            score.basePoints = 0; // Aucun point
            score.difficultyPoints = 0; // ✅ Aucun point de difficulté
        }

        // Bonus de vitesse (seulement si jeu terminé)
        if (isComplete) {
            const speedBonus = this.calculateSpeedBonus(timeInSeconds);
            if (speedBonus.multiplier > 1.0) {
                score.bonuses.speed = speedBonus;
                score.achievements.push(speedBonus.achievement);

                // ✅ Appliquer le bonus aux points de base seulement
                score.basePoints *= speedBonus.multiplier;
            }
        }

        // Bonus d'efficacité (nombre d'essais)
        const attemptsBonus = this.calculateAttemptsBonus(totalAttempts);
        if (attemptsBonus.multiplier > 1.0) {
            score.bonuses.attempts = attemptsBonus;
            score.achievements.push(attemptsBonus.achievement);

            // ✅ Appliquer le bonus aux points de base seulement
            score.basePoints *= attemptsBonus.multiplier;
        }

        // Bonus sans indices
        if (hintsUsed === 0) {
            score.bonuses.noHints = {
                multiplier: this.BONUSES.NO_HINTS,
                points: score.basePoints * (this.BONUSES.NO_HINTS - 1),
                name: 'Sans Aide',
                description: 'Aucun indice utilisé'
            };
            score.achievements.push('🧠 Pur Instinct');

            // ✅ Appliquer le bonus aux points de base seulement
            score.basePoints *= this.BONUSES.NO_HINTS;
        }

        // Bonus sans changement
        if (carChanges === 0) {
            score.bonuses.noChanges = {
                multiplier: this.BONUSES.NO_CHANGES,
                points: score.basePoints * (this.BONUSES.NO_CHANGES - 1),
                name: 'Persévérant',
                description: 'Aucun changement de voiture'
            };
            score.achievements.push('🎯 Déterminé');

            // ✅ Appliquer le bonus aux points de base seulement
            score.basePoints *= this.BONUSES.NO_CHANGES;
        }

        // Bonus jeu parfait
        const isPerfectGame = this.isPerfectGame(gameData);
        if (isPerfectGame.isPerfect) {
            score.bonuses.perfect = {
                multiplier: this.BONUSES.PERFECT_GAME,
                points: score.basePoints * (this.BONUSES.PERFECT_GAME - 1),
                name: 'Jeu Parfait',
                description: isPerfectGame.description
            };
            score.achievements.push('👑 MAÎTRE ABSOLU');

            // ✅ Appliquer le bonus aux points de base ET de difficulté
            score.basePoints *= this.BONUSES.PERFECT_GAME;
            score.difficultyPoints *= this.BONUSES.PERFECT_GAME;
        }

        // ✅ Arrondir les points
        score.basePoints = Math.round(score.basePoints * 10) / 10;
        score.difficultyPoints = Math.round(score.difficultyPoints * 10) / 10;

        // ✅ Calculer le total pour compatibilité
        score.totalPoints = score.basePoints + score.difficultyPoints;

        // Détails pour l'affichage
        score.details = {
            timeSpent: timeInSeconds,
            totalAttempts,
            hintsUsed,
            carChanges,
            difficulty: car.getDifficultyText(),
            carName: car.getFullName()
        };

        return score;
    }

    /**
     * Calcule le bonus de vitesse
     */
    calculateSpeedBonus(timeInSeconds) {
        if (timeInSeconds <= this.TIME_THRESHOLDS.LIGHTNING) {
            return {
                multiplier: this.BONUSES.SPEED.LIGHTNING,
                points: 0,
                name: 'Éclair',
                description: `Terminé en ${timeInSeconds}s`,
                achievement: '⚡ VITESSE ÉCLAIR'
            };
        } else if (timeInSeconds <= this.TIME_THRESHOLDS.FAST) {
            return {
                multiplier: this.BONUSES.SPEED.FAST,
                points: 0,
                name: 'Rapide',
                description: `Terminé en ${timeInSeconds}s`,
                achievement: '🚀 PILOTE DE COURSE'
            };
        } else if (timeInSeconds <= this.TIME_THRESHOLDS.QUICK) {
            return {
                multiplier: this.BONUSES.SPEED.QUICK,
                points: 0,
                name: 'Efficace',
                description: `Terminé en ${timeInSeconds}s`,
                achievement: '⭐ EFFICACE'
            };
        }

        return {
            multiplier: 1.0,
            points: 0,
            name: null,
            description: null,
            achievement: null
        };
    }

    /**
     * Calcule le bonus d'essais
     */
    calculateAttemptsBonus(totalAttempts) {
        if (totalAttempts === 1) {
            return {
                multiplier: this.BONUSES.ATTEMPTS.FIRST_TRY,
                points: 0,
                name: 'Premier Coup',
                description: 'Trouvé du premier essai',
                achievement: '🎯 UN COUP D\'ŒIL'
            };
        } else if (totalAttempts <= 3) {
            return {
                multiplier: this.BONUSES.ATTEMPTS.FEW_ATTEMPTS,
                points: 0,
                name: 'Très Efficace',
                description: `Trouvé en ${totalAttempts} essais`,
                achievement: '🎪 EXPERT'
            };
        } else if (totalAttempts <= 6) {
            return {
                multiplier: this.BONUSES.ATTEMPTS.DECENT,
                points: 0,
                name: 'Bon Résultat',
                description: `Trouvé en ${totalAttempts} essais`,
                achievement: '📊 PERFORMANT'
            };
        }

        return {
            multiplier: 1.0,
            points: 0,
            name: null,
            description: null,
            achievement: null
        };
    }

    /**
     * Vérifie si c'est un jeu parfait
     */
    isPerfectGame(gameData) {
        const { timeSpent, totalAttempts, hintsUsed, carChanges, isComplete, makeFound, modelFound } = gameData;
        const timeInSeconds = Math.round(timeSpent / 1000);

        const conditions = {
            complete: isComplete && makeFound && modelFound,
            fast: timeInSeconds <= this.TIME_THRESHOLDS.FAST,
            efficient: totalAttempts <= 3,
            noHelp: hintsUsed === 0,
            noChanges: carChanges === 0
        };

        const isPerfect = Object.values(conditions).every(condition => condition);

        return {
            isPerfect,
            description: isPerfect ?
                `Terminé en ${timeInSeconds}s, ${totalAttempts} essais, sans aide` :
                'Conditions non remplies',
            conditions
        };
    }

    /**
     * ✅ MODIFIÉ: Formate les résultats pour l'affichage avec les deux types de points
     */
    formatScoreDisplay(score) {
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
            display.title = '✅ Mission Accomplie !';
        }

        // ✅ Description avec les deux types de points
        display.description = `**${score.details.carName}** trouvée !\n`;
        display.description += `**Points de base:** ${score.basePoints}\n`;
        display.description += `**Points de difficulté:** ${score.difficultyPoints}\n`;
        display.description += `**Total:** ${score.totalPoints}`;

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

        return display;
    }
}

module.exports = EnhancedScoreCalculator;
