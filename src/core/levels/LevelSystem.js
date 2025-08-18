/**
 * Système de niveaux automobile avec références au sport auto et Sylvain Lyve
 * Basé sur les points totaux avec progression équilibrée et niveau max très difficile
 */

const LEVEL_SYSTEM = {
    levels: [
        // ========== NIVEAUX DÉBUTANTS (Humoristiques) ==========
        {
            minPoints: 0,
            maxPoints: 99,
            title: '🤡 Pire que Lance Stroll',
            color: '#8B4513', // Marron
            description: 'Même le pilote le plus critiqué de F1 fait mieux que ça !',
            emoji: '🤡'
        },
        {
            minPoints: 100,
            maxPoints: 249,
            title: '🚗 Conducteur du Dimanche',
            color: '#696969', // Gris foncé
            description: 'Vous conduisez votre Clio au supermarché, c\'est déjà ça !',
            emoji: '🚗'
        },
        {
            minPoints: 250,
            maxPoints: 499,
            title: '🔰 Apprenti Mécanicien',
            color: '#A0522D', // Brun
            description: 'Vous savez faire la vidange... enfin, vous essayez.',
            emoji: '🔰'
        },
        {
            minPoints: 500,
            maxPoints: 899,
            title: '🚙 Fan de SUV',
            color: '#4682B4', // Bleu acier
            description: 'Un Qashqai, c\'est sportif non ? Non ?',
            emoji: '🚙'
        },
        {
            minPoints: 900,
            maxPoints: 1499,
            title: '🏁 Spectateur de F1',
            color: '#708090', // Gris ardoise
            description: 'Vous regardez les courses du canapé avec des chips.',
            emoji: '🏁'
        },

        // ========== NIVEAUX INTERMÉDIAIRES ==========
        {
            minPoints: 1500,
            maxPoints: 2499,
            title: '🏎️ Pilote de Karting',
            color: '#9ACD32', // Vert jaune
            description: 'Enfin du vrai pilotage ! Même si c\'est sur un parking.',
            emoji: '🏎️'
        },
        {
            minPoints: 2500,
            maxPoints: 3999,
            title: '🚘 Propriétaire de GTI',
            color: '#32CD32', // Vert citron
            description: 'Golf GTI ou 208 GTI, vous avez du goût !',
            emoji: '🚘'
        },
        {
            minPoints: 4000,
            maxPoints: 6499,
            title: '🏃 Coureur Amateur',
            color: '#FF6347', // Tomate
            description: 'Trackdays le weekend, embouteillages la semaine.',
            emoji: '🏃'
        },
        {
            minPoints: 6500,
            maxPoints: 9999,
            title: '🔧 Mécanicien Confirmé',
            color: '#FFD700', // Or
            description: 'Vous savez distinguer un flat-6 d\'un V6 !',
            emoji: '🔧'
        },
        {
            minPoints: 10000,
            maxPoints: 15999,
            title: '🚀 Passionné de Supercars',
            color: '#FF4500', // Orange rouge
            description: 'Ferrari, Lamborghini... vous connaissez par cœur !',
            emoji: '🚀'
        },

        // ========== NIVEAUX AVANCÉS ==========
        {
            minPoints: 16000,
            maxPoints: 24999,
            title: '🏆 Julien Febreau',
            color: '#9932CC', // Violet foncé
            description: 'Vous avez la culture auto du journaliste de Sport Auto !',
            emoji: '🏆'
        },
        {
            minPoints: 25000,
            maxPoints: 39999,
            title: '⭐ Soheil Ayari',
            color: '#00CED1', // Turquoise foncé
            description: 'Votre expertise rappelle celle du pilote instructeur !',
            emoji: '⭐'
        },
        {
            minPoints: 40000,
            maxPoints: 64999,
            title: '🎯 Sébastien Loeb',
            color: '#FF1493', // Rose profond
            description: 'Nonuple champion du monde, respect !',
            emoji: '🎯'
        },
        {
            minPoints: 65000,
            maxPoints: 99999,
            title: '👑 Alain Prost',
            color: '#8A2BE2', // Violet bleu
            description: 'Le Professeur serait fier de vos connaissances !',
            emoji: '👑'
        },
        {
            minPoints: 100000,
            maxPoints: 159999,
            title: '🌟 Ayrton Senna',
            color: '#FF6B35', // Orange vif
            description: 'La légende brésilienne approuverait votre passion !',
            emoji: '🌟'
        },

        // ========== NIVEAUX EXPERTS ==========
        {
            minPoints: 160000,
            maxPoints: 249999,
            title: '🔥 Encyclopédie Vivante',
            color: '#DC143C', // Cramoisi
            description: 'Vous êtes une bible automobile sur pattes !',
            emoji: '🔥'
        },
        {
            minPoints: 250000,
            maxPoints: 399999,
            title: '⚡ Sage de l\'Automobile',
            color: '#4169E1', // Bleu royal
            description: 'Votre savoir dépasse l\'entendement humain !',
            emoji: '⚡'
        },
        {
            minPoints: 400000,
            maxPoints: 649999,
            title: '🌪️ Maître Absolu',
            color: '#8B008B', // Magenta foncé
            description: 'Il n\'y a plus grand chose que vous ignoriez !',
            emoji: '🌪️'
        },
        {
            minPoints: 650000,
            maxPoints: 999999,
            title: '🗲 Génie de l\'Automobile',
            color: '#000080', // Bleu marine
            description: 'Vous frôlez la perfection, c\'est impressionnant !',
            emoji: '🗲'
        },

        // ========== NIVEAU ULTIME (Référence Sylvain Lyve) ==========
        {
            minPoints: 1000000,
            maxPoints: Number.MAX_SAFE_INTEGER,
            title: '🧠 Sylvain Lyve',
            color: '#191970', // Bleu nuit
            description: 'Vous avez atteint le niveau du maître absolu de YouTube automobile ! Sylvain serait impressionné par votre culture !',
            emoji: '🧠'
        }
    ],

    /**
     * Obtient le niveau d'un joueur basé sur ses points totaux
     */
    getPlayerLevel(totalPoints) {
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
                message: '🎊 Niveau maximum atteint ! Vous êtes au niveau de Sylvain Lyve !'
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
    },

    /**
     * Obtient des statistiques sur la distribution des niveaux
     */
    getLevelStats() {
        return {
            totalLevels: this.levels.length,
            maxPointsToReach: this.levels[this.levels.length - 1].minPoints,
            levelsByDifficulty: {
                beginner: this.levels.slice(0, 5).length,
                intermediate: this.levels.slice(5, 10).length,
                advanced: this.levels.slice(10, 15).length,
                expert: this.levels.slice(15, 19).length,
                master: 1
            }
        };
    }
};

module.exports = LEVEL_SYSTEM;
