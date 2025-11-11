// src/core/game/utils/EnhancedScoreCalculator.js - Version sans difficultyPoints

class EnhancedScoreCalculator {
    constructor() {
        // Seuils de temps pour les bonus (en secondes)
        this.TIME_THRESHOLDS = {
            LIGHTNING: 20,  // ⚡ Éclair (sous 20s) - très rare
            FAST: 35,       // 🚀 Rapide (20s-35s) - plus rapide que la moyenne
            QUICK: 60,      // ⭐ Efficace (35s-60s) - proche de la moyenne
            NORMAL: 90      // 🎯 Normal (60s-90s) - au-dessus de la moyenne
        };

        // Multiplicateurs de bonus (rééquilibrés)
        this.BONUSES = {
            SPEED: {
                LIGHTNING: 2.5,  // x2.5 pour être ultra-rapide (< 20s)
                FAST: 2.0,       // x2.0 pour être rapide (20-35s)
                QUICK: 1.5,      // x1.5 pour être efficace (35-60s)
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
            PERFECT_GAME: 3.0        // x3.0 pour un jeu parfait (toutes conditions)
        };

        // Note: Les points de base sont maintenant définis par la rareté de la voiture (×10)
        // commune: 100pts, peu_commune: 250pts, rare: 500pts, epique: 1000pts, legendaire: 2000pts
        // Voir car.getBasePoints() pour les valeurs actuelles
    }

    /**
     * Calcule le score complet avec tous les bonus
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
        // Utiliser les points de base de la voiture selon sa rareté
        const basePoints = car.getBasePoints();

        let score = {
            basePoints: 0,
            totalPoints: 0,
            bonuses: {},
            achievements: [],
            details: {}
        };

        // Points de base selon le succès
        if (isComplete && makeFound && modelFound) {
            score.basePoints = basePoints; // Points complets
        } else if (makeFound) {
            score.basePoints = basePoints * 0.5; // Points partiels
        } else {
            score.basePoints = 0; // Aucun point
        }

        // Bonus de vitesse (seulement si jeu terminé)
        if (isComplete) {
            const speedBonus = this.calculateSpeedBonus(timeInSeconds);
            if (speedBonus.multiplier > 1.0) {
                score.bonuses.speed = speedBonus;
                score.achievements.push(speedBonus.achievement);
                score.basePoints *= speedBonus.multiplier;
            }
        }

        // Bonus d'efficacité (nombre d'essais)
        const attemptsBonus = this.calculateAttemptsBonus(totalAttempts);
        if (attemptsBonus.multiplier > 1.0) {
            score.bonuses.attempts = attemptsBonus;
            score.achievements.push(attemptsBonus.achievement);
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
            score.basePoints *= this.BONUSES.PERFECT_GAME;
        }

        // Arrondir les points
        score.basePoints = Math.round(score.basePoints * 10) / 10;
        score.totalPoints = score.basePoints;

        // Détails pour l'affichage
        score.details = {
            timeSpent: timeInSeconds,
            totalAttempts,
            hintsUsed,
            carChanges,
            rarity: car.getRarityText(), // Utiliser la rareté au lieu de la difficulté
            rarityName: car.getRarityName(),
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
     * Formate les résultats pour l'affichage
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

        // Description avec les points
        display.description = `**${score.details.carName}** trouvée !\n`;
        display.description += `**Points gagnés:** ${score.totalPoints}`;

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
            value: `**Temps:** ${score.details.timeSpent}s\n**Essais:** ${score.details.totalAttempts}\n**Rareté:** ${score.details.rarity}`,
            inline: true
        });

        return display;
    }
}

module.exports = EnhancedScoreCalculator;
