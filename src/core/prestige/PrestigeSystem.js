// src/core/prestige/PrestigeSystem.js

const { supabase } = require('../../shared/database/connection');
const logger = require('../../shared/utils/logger');

/**
 * Système de gestion des prestiges
 * Gère les niveaux de prestige, multiplicateurs et progression
 */
class PrestigeSystem {
    constructor() {
        this.prestigeLevels = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Charge les niveaux de prestige depuis la base de données
     */
    async loadPrestigeLevels() {
        try {
            // Vérifier le cache
            if (this.prestigeLevels && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                return this.prestigeLevels;
            }

            const { data, error } = await supabase
                .from('prestige_levels')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                logger.error('Error loading prestige levels:', error);
                return this.getFallbackPrestigeLevels();
            }

            this.prestigeLevels = data;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;

            logger.info(`✅ Loaded ${data.length} prestige levels`);
            return this.prestigeLevels;
        } catch (error) {
            logger.error('Exception loading prestige levels:', error);
            return this.getFallbackPrestigeLevels();
        }
    }

    /**
     * Obtient les niveaux de prestige en fallback si la BDD échoue
     */
    getFallbackPrestigeLevels() {
        return [
            { id: 0, name: 'Normal', emoji: '', multiplier: 1.0, points_required: 1000000, total_points_cumulative: 1000000, color: '#FFFFFF', animation_class: 'prestige-normal' },
            { id: 1, name: 'Bronze', emoji: '🥉', multiplier: 1.5, points_required: 1500000, total_points_cumulative: 2500000, color: '#CD7F32', animation_class: 'prestige-bronze' },
            { id: 2, name: 'Bronze II', emoji: '🥉', multiplier: 2.0, points_required: 2000000, total_points_cumulative: 4500000, color: '#CD7F32', animation_class: 'prestige-bronze-glow' },
            { id: 3, name: 'Argent', emoji: '🥈', multiplier: 2.5, points_required: 2500000, total_points_cumulative: 7000000, color: '#C0C0C0', animation_class: 'prestige-silver' },
            { id: 4, name: 'Argent II', emoji: '🥈', multiplier: 3.0, points_required: 3000000, total_points_cumulative: 10000000, color: '#C0C0C0', animation_class: 'prestige-silver-glow' },
            { id: 5, name: 'Or', emoji: '🥇', multiplier: 4.0, points_required: 4000000, total_points_cumulative: 14000000, color: '#FFD700', animation_class: 'prestige-gold' },
            { id: 6, name: 'Or II', emoji: '🥇', multiplier: 5.0, points_required: 5000000, total_points_cumulative: 19000000, color: '#FFD700', animation_class: 'prestige-gold-glow' },
            { id: 7, name: 'Diamant', emoji: '💎', multiplier: 6.5, points_required: 6500000, total_points_cumulative: 25500000, color: '#00CED1', animation_class: 'prestige-diamond' },
            { id: 8, name: 'Diamant II', emoji: '💎', multiplier: 8.5, points_required: 8500000, total_points_cumulative: 34000000, color: '#00CED1', animation_class: 'prestige-diamond-glow' },
            { id: 9, name: 'Maître', emoji: '👑', multiplier: 11.0, points_required: 11000000, total_points_cumulative: 45000000, color: '#9370DB', animation_class: 'prestige-master' },
            { id: 10, name: 'LÉGENDE', emoji: '👑', multiplier: 15.0, points_required: 15000000, total_points_cumulative: 60000000, color: '#FF1493', animation_class: 'prestige-legend' }
        ];
    }

    /**
     * Obtient les informations d'un niveau de prestige
     */
    async getPrestigeLevel(prestigeLevel) {
        const levels = await this.loadPrestigeLevels();
        return levels.find(l => l.id === prestigeLevel) || levels[0];
    }

    /**
     * Obtient le multiplicateur pour un niveau de prestige
     */
    async getPrestigeMultiplier(prestigeLevel) {
        const level = await this.getPrestigeLevel(prestigeLevel);
        return level ? level.multiplier : 1.0;
    }

    /**
     * Vérifie si un joueur peut prestigier
     * @param {number} prestigePoints - Points actuels dans le prestige
     * @param {number} prestigeLevel - Niveau de prestige actuel
     * @param {number} currentLevel - Niveau actuel du joueur (1-20)
     */
    async canPrestige(prestigePoints, prestigeLevel, currentLevel) {
        // Doit être niveau 20 (1M points)
        if (currentLevel < 20) {
            return {
                canPrestige: false,
                reason: 'Vous devez atteindre le niveau 20 pour pouvoir prestigier',
                currentLevel,
                requiredLevel: 20
            };
        }

        // Vérifier qu'on n'est pas déjà au prestige max
        const levels = await this.loadPrestigeLevels();
        const maxPrestige = Math.max(...levels.map(l => l.id));

        if (prestigeLevel >= maxPrestige) {
            return {
                canPrestige: false,
                reason: 'Vous avez atteint le prestige maximum !',
                prestigeLevel,
                maxPrestige
            };
        }

        return {
            canPrestige: true,
            nextPrestige: prestigeLevel + 1,
            nextPrestigeInfo: await this.getPrestigeLevel(prestigeLevel + 1)
        };
    }

    /**
     * Calcule les points absolus totaux d'un joueur
     * Points absolus = tous les points gagnés à travers tous les prestiges
     */
    async calculateAbsolutePoints(prestigeLevel, prestigePoints) {
        if (prestigeLevel === 0) {
            return prestigePoints;
        }

        const levels = await this.loadPrestigeLevels();
        const previousPrestige = levels.find(l => l.id === prestigeLevel - 1);

        if (!previousPrestige) {
            return prestigePoints;
        }

        return previousPrestige.total_points_cumulative + prestigePoints;
    }

    /**
     * Calcule les points requis pour le prochain prestige
     */
    async getPointsToNextPrestige(prestigeLevel, prestigePoints) {
        const currentPrestige = await this.getPrestigeLevel(prestigeLevel);

        if (!currentPrestige) {
            return null;
        }

        const pointsNeeded = currentPrestige.points_required - prestigePoints;

        return {
            currentPoints: prestigePoints,
            pointsRequired: currentPrestige.points_required,
            pointsNeeded: Math.max(0, pointsNeeded),
            progress: Math.min(100, (prestigePoints / currentPrestige.points_required) * 100)
        };
    }

    /**
     * Formate l'affichage du prestige pour Discord
     */
    async formatPrestigeDisplay(prestigeLevel, includeEmoji = true) {
        const prestige = await this.getPrestigeLevel(prestigeLevel);

        if (!prestige || prestigeLevel === 0) {
            return '';
        }

        if (includeEmoji && prestige.emoji) {
            return `${prestige.emoji} ${prestige.name}`;
        }

        return prestige.name;
    }

    /**
     * Obtient le classement des joueurs par points absolus
     */
    async getAbsoluteLeaderboard(limit = 10) {
        try {
            const { data, error } = await supabase
                .rpc('get_absolute_leaderboard', { p_limit: limit });

            if (error) {
                logger.error('Error getting absolute leaderboard:', error);
                return [];
            }

            return data;
        } catch (error) {
            logger.error('Exception getting absolute leaderboard:', error);
            return [];
        }
    }

    /**
     * Obtient les statistiques de prestige globales
     */
    async getPrestigeStats() {
        try {
            const { data, error } = await supabase
                .from('user_scores')
                .select('prestige_level')
                .gte('prestige_level', 1);

            if (error) {
                logger.error('Error getting prestige stats:', error);
                return null;
            }

            // Compter les joueurs par niveau de prestige
            const prestigeCounts = {};
            data.forEach(player => {
                const level = player.prestige_level;
                prestigeCounts[level] = (prestigeCounts[level] || 0) + 1;
            });

            return {
                totalPrestigedPlayers: data.length,
                byLevel: prestigeCounts,
                highestPrestige: data.length > 0 ? Math.max(...data.map(p => p.prestige_level)) : 0
            };
        } catch (error) {
            logger.error('Exception getting prestige stats:', error);
            return null;
        }
    }

    /**
     * Réinitialise le cache (utile pour les tests)
     */
    clearCache() {
        this.prestigeLevels = null;
        this.cacheExpiry = null;
        logger.info('Prestige system cache cleared');
    }
}

// Export singleton
module.exports = new PrestigeSystem();
