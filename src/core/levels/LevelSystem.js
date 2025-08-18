/**
 * Système de niveaux avec titres généraux - Version plus difficile
 * Seul le premier niveau fait référence à Lance Stroll (F1)
 * Les seuils sont beaucoup plus élevés pour rendre la progression plus difficile
 */

const LEVEL_SYSTEM = {
    levels: [
        // ========== NIVEAUX BAS (Rabaissants) ==========
        {
            minPoints: 0,
            maxPoints: 49,
            title: '🤡 Même Lance Stroll ferait mieux',
            color: '#8B4513', // Marron
            description: 'Vraiment... même le pilote le plus critiqué de la grille ferait mieux !',
            emoji: '🤡'
        },
        {
            minPoints: 50,
            maxPoints: 99,
            title: '🦶 Débutant Catastrophique',
            color: '#696969', // Gris foncé
            description: 'Au moins vous avez essayé... mais c\'était pas terrible.',
            emoji: '🦶'
        },
        {
            minPoints: 100,
            maxPoints: 199,
            title: '🐌 Apprenti Maladroit',
            color: '#A0522D', // Brun
            description: 'Lentement mais sûrement... enfin surtout lentement.',
            emoji: '🐌'
        },
        {
            minPoints: 200,
            maxPoints: 349,
            title: '🔧 Bricoleur du Dimanche',
            color: '#4682B4', // Bleu acier
            description: 'Vos méthodes sont... créatives, disons.',
            emoji: '🔧'
        },
        {
            minPoints: 350,
            maxPoints: 549,
            title: '📚 Élève en Difficulté',
            color: '#708090', // Gris ardoise
            description: 'Il va falloir réviser vos classiques.',
            emoji: '📚'
        },

        // ========== NIVEAUX MOYENS (Progression) ==========
        {
            minPoints: 550,
            maxPoints: 799,
            title: '🌱 Pousse Timide',
            color: '#9ACD32', // Vert jaune
            description: 'Ça commence à pousser, continuez !',
            emoji: '🌱'
        },
        {
            minPoints: 800,
            maxPoints: 1199,
            title: '⚡ Étincelle Prometteuse',
            color: '#32CD32', // Vert citron
            description: 'On voit des éclairs de talent !',
            emoji: '⚡'
        },
        {
            minPoints: 1200,
            maxPoints: 1799,
            title: '🎯 Tireur d\'Élite',
            color: '#FF6347', // Tomate
            description: 'Vous commencez à faire mouche !',
            emoji: '🎯'
        },
        {
            minPoints: 1800,
            maxPoints: 2599,
            title: '🏆 Compétiteur Sérieux',
            color: '#FFD700', // Or
            description: 'Maintenant on peut parler affaires !',
            emoji: '🏆'
        },
        {
            minPoints: 2600,
            maxPoints: 3699,
            title: '🥇 Champion en Herbe',
            color: '#FF4500', // Orange rouge
            description: 'Le talent commence à vraiment se voir !',
            emoji: '🥇'
        },

        // ========== NIVEAUX ÉLEVÉS (Impressionnants) ==========
        {
            minPoints: 3700,
            maxPoints: 5499,
            title: '⭐ Virtuose Confirmé',
            color: '#9932CC', // Violet foncé
            description: 'Vous maîtrisez votre art !',
            emoji: '⭐'
        },
        {
            minPoints: 5500,
            maxPoints: 7999,
            title: '💎 Diamant Brut',
            color: '#00CED1', // Turquoise foncé
            description: 'Rare et précieux, vous brillez !',
            emoji: '💎'
        },
        {
            minPoints: 8000,
            maxPoints: 11999,
            title: '🚀 Phénomène Ascendant',
            color: '#FF1493', // Rose profond
            description: 'Vous décollez vers les sommets !',
            emoji: '🚀'
        },
        {
            minPoints: 12000,
            maxPoints: 17999,
            title: '👑 Maître Incontesté',
            color: '#8A2BE2', // Violet bleu
            description: 'Vous dominez votre domaine !',
            emoji: '👑'
        },
        {
            minPoints: 18000,
            maxPoints: 26999,
            title: '🌟 Étoile Montante',
            color: '#FF6B35', // Orange vif
            description: 'Votre éclat illumine tout !',
            emoji: '🌟'
        },

        // ========== NIVEAUX TRÈS ÉLEVÉS (Exceptionnels) ==========
        {
            minPoints: 1500,
            maxPoints: 2499,
            title: '🔥 Force de la Nature',
            color: '#DC143C', // Cramoisi
            description: 'Rien ne peut vous arrêter !',
            emoji: '🔥'
        },
        {
            minPoints: 2500,
            maxPoints: 3999,
            title: '⚡ Foudre Vivante',
            color: '#FFD700', // Or brillant
            description: 'Vous frappez avec la puissance de l\'éclair !',
            emoji: '⚡'
        },
        {
            minPoints: 4000,
            maxPoints: 6499,
            title: '🌪️ Ouragan Déchaîné',
            color: '#4169E1', // Bleu royal
            description: 'Vous balayez tout sur votre passage !',
            emoji: '🌪️'
        },
        {
            minPoints: 6500,
            maxPoints: 9999,
            title: '🗲 Dieu du Tonnerre',
            color: '#8B008B', // Magenta foncé
            description: 'Votre pouvoir résonne dans les cieux !',
            emoji: '🗲'
        },

        // ========== NIVEAU ULTIME (Ultra difficile) ==========
        {
            minPoints: 10000,
            maxPoints: 17999,
            title: '🌌 Transcendance Cosmique',
            color: '#000080', // Bleu marine
            description: 'Vous avez dépassé les limites de l\'entendement humain.',
            emoji: '🌌'
        },
        {
            minPoints: 18000,
            maxPoints: 29999,
            title: '∞ Entité Omnisciente',
            color: '#191970', // Bleu nuit
            description: 'Vous êtes devenu une légende vivante, maître de tous les mystères.',
            emoji: '∞'
        },
        {
            minPoints: 30000,
            maxPoints: Number.MAX_SAFE_INTEGER,
            title: '🕳️ Singularité Absolue',
            color: '#000000', // Noir absolu
            description: 'Vous avez atteint l\'impossible. L\'univers lui-même vous révère.',
            emoji: '🕳️'
        }
    ],

    // Dans getPlayerLevel()
    getPlayerLevel(totalPoints) { // Utiliser totalPoints au lieu de totalDifficultyPoints
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (totalPoints >= this.levels[i].minPoints) {
                return {
                    ...this.levels[i],
                    levelIndex: i,
                    progress: this.calculateProgress(totalPoints, this.levels[i]),
                    nextLevel: i < this.levels.length - 1 ? this.levels[i + 1] : null
                };
            }
        }
        return this.levels[0];
    },

    /**
     * Calcule le pourcentage de progression dans le niveau actuel
     */
    calculateProgress(points, level) {
        if (level.maxPoints === Number.MAX_SAFE_INTEGER) {
            return 100; // Niveau max atteint
        }

        const levelRange = level.maxPoints - level.minPoints + 1;
        const pointsInLevel = points - level.minPoints;
        return Math.min(100, Math.max(0, (pointsInLevel / levelRange) * 100));
    },

    /**
     * Obtient les informations de progression vers le niveau suivant
     */
    getProgressToNextLevel(totalPoints) {
        const currentLevel = this.getPlayerLevel(totalPoints);

        if (!currentLevel.nextLevel) {
            return {
                isMaxLevel: true,
                message: '🎊 Niveau maximum atteint ! Vous êtes une légende !'
            };
        }

        const pointsNeeded = currentLevel.nextLevel.minPoints - totalPoints;
        return {
            isMaxLevel: false,
            pointsNeeded,
            nextLevelTitle: currentLevel.nextLevel.title,
            progressPercentage: currentLevel.progress
        };
    },

    /**
     * Génère une barre de progression visuelle
     */
    generateProgressBar(percentage, length = 10) {
        const filled = Math.floor((percentage / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    },

    /**
     * Convertit une couleur hex en nombre décimal pour Discord
     */
    hexToDecimal(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }
};

module.exports = LEVEL_SYSTEM;
