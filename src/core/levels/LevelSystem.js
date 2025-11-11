/**
 * Système de niveaux automobile - Basé sur la base de données
 * Les niveaux sont chargés depuis la table `levels` de Supabase
 */

const logger = require('../../shared/utils/logger');
const { supabase } = require('../../shared/database/connection');

class LevelSystem {
    constructor() {
        this.levels = null;
        this.lastFetch = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes de cache
    }

    /**
     * Charge les niveaux depuis la base de données
     */
    async loadLevels() {
        try {
            // Utilise le cache si disponible et récent
            if (this.levels && this.lastFetch && (Date.now() - this.lastFetch) < this.CACHE_DURATION) {
                return this.levels;
            }

            const { data, error } = await supabase
                .from('levels')
                .select('*')
                .order('minPoints', { ascending: true });

            if (error) {
                logger.error('Erreur lors du chargement des niveaux:', error);
                // Retourne un niveau par défaut en cas d'erreur
                return this.getDefaultLevels();
            }

            // Convertit les données DB en format utilisable
            this.levels = data.map((level, index) => ({
                id: level.id,
                minPoints: level.minPoints,
                maxPoints: level.maxPoints,
                title: level.title,
                description: level.description,
                emoji: level.emoji,
                color: this.getLevelColor(index),
                animationClass: level.animation_class || 'level-static',
                levelIndex: index
            }));

            this.lastFetch = Date.now();
            logger.info(`✅ ${this.levels.length} niveaux chargés depuis la base de données`);

            return this.levels;
        } catch (error) {
            logger.error('Erreur lors du chargement des niveaux:', error);
            return this.getDefaultLevels();
        }
    }

    /**
     * Obtient le niveau d'un joueur basé sur ses points totaux
     */
    async getPlayerLevel(totalPoints) {
        const levels = await this.loadLevels();

        // Trouve le niveau correspondant aux points
        for (let i = levels.length - 1; i >= 0; i--) {
            if (totalPoints >= levels[i].minPoints) {
                const level = levels[i];
                const nextLevel = i < levels.length - 1 ? levels[i + 1] : null;
                const isMaxLevel = !nextLevel || level.maxPoints >= 9999999999;

                return {
                    ...level,
                    progress: this.calculateProgress(totalPoints, level, isMaxLevel),
                    nextLevel
                };
            }
        }

        // Par défaut, retourne le premier niveau
        const nextLevel = levels.length > 1 ? levels[1] : null;
        return {
            ...levels[0],
            progress: this.calculateProgress(totalPoints, levels[0], false),
            nextLevel
        };
    }

    /**
     * Calcule le pourcentage de progression dans le niveau actuel
     */
    calculateProgress(points, level, isMaxLevel = false) {
        // Niveau max atteint
        if (isMaxLevel) {
            return 100;
        }

        const levelRange = level.maxPoints - level.minPoints;
        const pointsInLevel = points - level.minPoints;
        return Math.min(100, Math.max(0, (pointsInLevel / levelRange) * 100));
    }

    /**
     * Obtient les informations de progression vers le niveau suivant
     */
    async getProgressToNextLevel(totalPoints) {
        const currentLevel = await this.getPlayerLevel(totalPoints);

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
    }

    /**
     * Génère une barre de progression visuelle
     */
    generateProgressBar(percentage, length = 10) {
        // Vérifier que percentage est un nombre valide
        if (isNaN(percentage) || percentage === null || percentage === undefined) {
            percentage = 0;
        }

        const filled = Math.floor((percentage / 100) * length);
        const empty = length - filled;

        // Utiliser des emojis carrés pour une meilleure compatibilité Discord
        return '🟦'.repeat(filled) + '⬜'.repeat(empty);
    }

    /**
     * Convertit une couleur hex en nombre décimal pour Discord
     */
    hexToDecimal(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }

    /**
     * Obtient la couleur d'un niveau selon son index
     */
    getLevelColor(index) {
        const colors = [
            '#8B4513', // Marron - Niveau 0
            '#696969', // Gris foncé - Niveau 1
            '#A0522D', // Brun - Niveau 2
            '#4682B4', // Bleu acier - Niveau 3
            '#708090', // Gris ardoise - Niveau 4
            '#9ACD32', // Vert jaune - Niveau 5
            '#32CD32', // Vert citron - Niveau 6
            '#FF6347', // Tomate - Niveau 7
            '#FFD700', // Or - Niveau 8
            '#FF4500', // Orange rouge - Niveau 9
            '#9932CC', // Violet foncé - Niveau 10
            '#00CED1', // Turquoise foncé - Niveau 11
            '#FF1493', // Rose profond - Niveau 12
            '#8A2BE2', // Violet bleu - Niveau 13
            '#FF6B35', // Orange vif - Niveau 14
            '#DC143C', // Cramoisi - Niveau 15
            '#4169E1', // Bleu royal - Niveau 16
            '#8B008B', // Magenta foncé - Niveau 17
            '#000080', // Bleu marine - Niveau 18
            '#191970'  // Bleu nuit - Niveau 19 (Sylvain Lyve)
        ];

        return colors[index] || '#696969';
    }

    /**
     * Niveaux par défaut en cas d'erreur de chargement
     */
    getDefaultLevels() {
        return [
            {
                id: 1,
                minPoints: 0,
                maxPoints: 99,
                title: '🤡 Pire que Lance Stroll',
                color: '#8B4513',
                description: 'Même le pilote le plus critiqué de F1 fait mieux que ça !',
                emoji: '🤡',
                animationClass: 'level-static',
                levelIndex: 0
            },
            {
                id: 2,
                minPoints: 100,
                maxPoints: 249,
                title: '🚗 Conducteur du Dimanche',
                color: '#696969',
                description: 'Vous conduisez votre Clio au supermarché, c\'est déjà ça !',
                emoji: '🚗',
                animationClass: 'level-static',
                levelIndex: 1
            }
        ];
    }

    /**
     * Obtient des statistiques sur la distribution des niveaux
     */
    async getLevelStats() {
        const levels = await this.loadLevels();

        return {
            totalLevels: levels.length,
            maxPointsToReach: levels[levels.length - 1]?.minPoints || 1000000,
            levelsByDifficulty: {
                beginner: levels.slice(0, 5).length,
                intermediate: levels.slice(5, 10).length,
                advanced: levels.slice(10, 15).length,
                expert: levels.slice(15, 19).length,
                master: levels.length > 19 ? 1 : 0
            }
        };
    }

    /**
     * Invalide le cache des niveaux
     */
    clearCache() {
        this.levels = null;
        this.lastFetch = null;
        logger.info('🔄 Cache des niveaux invalidé');
    }
}

// Export une instance singleton
module.exports = new LevelSystem();
