const logger = require('../../shared/utils/logger');
const discordConfig = require('../../shared/config/discord');

/**
 * Gestionnaire de rôles Discord basé sur le niveau et le prestige
 */
class RoleManager {
    constructor() {
        // ID du serveur officiel (seul serveur où les rôles sont gérés)
        this.officialGuildId = discordConfig.officialGuildId;

        // Configuration des rôles par prestige
        this.prestigeRoles = {
            0: { name: 'Normal', color: '#808080' },         // Gris
            1: { name: 'Bronze', color: '#CD7F32' },         // Bronze
            2: { name: 'Bronze II', color: '#B87333' },      // Bronze foncé
            3: { name: 'Argent', color: '#C0C0C0' },         // Argent
            4: { name: 'Argent II', color: '#A8A8A8' },      // Argent foncé
            5: { name: 'Or', color: '#FFD700' },             // Or
            6: { name: 'Or II', color: '#FFA500' },          // Or foncé
            7: { name: 'Diamant', color: '#B9F2FF' },        // Diamant
            8: { name: 'Diamant II', color: '#00CED1' },     // Diamant foncé
            9: { name: 'Maître', color: '#9400D3' },         // Violet
            10: { name: 'LÉGENDE', color: '#FF0000' }        // Rouge
        };

        // Configuration des rôles par niveau (tous les 5 niveaux)
        // Ordre inversé pour création hiérarchique (plus haut = plus important)
        this.levelMilestones = [
            { level: 20, name: 'Niveau 20 (Max)', color: '#E74C3C', position: 1 },
            { level: 15, name: 'Niveau 15+', color: '#9B59B6', position: 2 },
            { level: 10, name: 'Niveau 10+', color: '#3498DB', position: 3 },
            { level: 5, name: 'Niveau 5+', color: '#95A5A6', position: 4 }
        ];
    }

    /**
     * Synchronise les rôles d'un utilisateur sur un serveur
     * @param {Object} guild - Le serveur Discord
     * @param {string} userId - L'ID de l'utilisateur
     * @param {number} level - Le niveau du joueur
     * @param {number} prestigeLevel - Le niveau de prestige
     */
    async syncUserRoles(guild, userId, level, prestigeLevel) {
        try {
            // Vérifier si c'est le serveur officiel
            if (!this.isOfficialGuild(guild.id)) {
                logger.debug(`Skipping role sync for non-official guild ${guild.id}`);
                return;
            }

            // Récupérer le membre du serveur
            const member = await guild.members.fetch(userId);
            if (!member) {
                logger.warn(`Member ${userId} not found in guild ${guild.id}`);
                return;
            }

            // S'assurer que tous les rôles nécessaires existent
            await this.ensureRolesExist(guild);

            // Mettre à jour le rôle de prestige
            await this.updatePrestigeRole(guild, member, prestigeLevel);

            // Mettre à jour le rôle de niveau
            await this.updateLevelRole(guild, member, level);

            logger.info(`Roles synced for user ${userId}`, {
                level,
                prestigeLevel,
                guildId: guild.id
            });

        } catch (error) {
            logger.error('Error syncing user roles:', error);
        }
    }

    /**
     * Vérifie si un serveur est le serveur officiel
     * @param {string} guildId - L'ID du serveur
     * @returns {boolean}
     */
    isOfficialGuild(guildId) {
        if (!this.officialGuildId) {
            logger.warn('OFFICIAL_GUILD_ID not configured - role management disabled');
            return false;
        }
        return guildId === this.officialGuildId;
    }

    /**
     * Met à jour le rôle de prestige d'un membre
     */
    async updatePrestigeRole(guild, member, prestigeLevel) {
        try {
            const prestigeConfig = this.prestigeRoles[prestigeLevel];
            if (!prestigeConfig) return;

            const targetRoleName = prestigeConfig.name;

            // Retirer tous les anciens rôles de prestige
            const prestigeRolesToRemove = member.roles.cache.filter(role =>
                Object.values(this.prestigeRoles).some(p =>
                    role.name === p.name
                )
            );

            for (const role of prestigeRolesToRemove.values()) {
                if (role.name !== targetRoleName) {
                    await member.roles.remove(role);
                }
            }

            // Ajouter le nouveau rôle de prestige
            const targetRole = guild.roles.cache.find(r => r.name === targetRoleName);
            if (targetRole && !member.roles.cache.has(targetRole.id)) {
                await member.roles.add(targetRole);
                logger.info(`Added prestige role ${targetRoleName} to ${member.user.tag}`);
            }

        } catch (error) {
            logger.error('Error updating prestige role:', error);
        }
    }

    /**
     * Met à jour le rôle de niveau d'un membre
     */
    async updateLevelRole(guild, member, level) {
        try {
            // Trouver le palier de niveau approprié
            // Chercher de bas en haut (la liste est maintenant triée de haut en bas)
            const milestone = [...this.levelMilestones]
                .reverse()
                .find(m => level >= m.level);

            if (!milestone) return;

            const targetRoleName = milestone.name;

            // Retirer tous les anciens rôles de niveau
            const levelRolesToRemove = member.roles.cache.filter(role =>
                this.levelMilestones.some(m => role.name === m.name)
            );

            for (const role of levelRolesToRemove.values()) {
                if (role.name !== targetRoleName) {
                    await member.roles.remove(role);
                }
            }

            // Ajouter le nouveau rôle de niveau
            const targetRole = guild.roles.cache.find(r => r.name === targetRoleName);
            if (targetRole && !member.roles.cache.has(targetRole.id)) {
                await member.roles.add(targetRole);
                logger.info(`Added level role ${targetRoleName} to ${member.user.tag}`);
            }

        } catch (error) {
            logger.error('Error updating level role:', error);
        }
    }

    /**
     * S'assure que tous les rôles nécessaires existent sur le serveur
     * Créé dans l'ordre hiérarchique (plus haut = plus prestigieux)
     */
    async ensureRolesExist(guild) {
        try {
            // Créer les rôles de prestige dans l'ordre décroissant (LÉGENDE -> Normal)
            // Pour que LÉGENDE soit en haut de la hiérarchie
            const prestigeLevels = Object.entries(this.prestigeRoles).reverse();

            for (const [level, config] of prestigeLevels) {
                const roleName = config.name;
                const existingRole = guild.roles.cache.find(r => r.name === roleName);

                if (!existingRole) {
                    await guild.roles.create({
                        name: roleName,
                        color: config.color,
                        reason: 'Rôle de prestige GuessTheCar',
                        mentionable: false,
                        hoist: true // Afficher séparément dans la liste des membres
                    });
                    logger.info(`Created prestige role: ${roleName}`);
                }
            }

            // Créer les rôles de niveau dans l'ordre (déjà trié de haut en bas)
            // Niveau 20 -> Niveau 5
            for (const milestone of this.levelMilestones) {
                const roleName = milestone.name;
                const existingRole = guild.roles.cache.find(r => r.name === roleName);

                if (!existingRole) {
                    await guild.roles.create({
                        name: roleName,
                        color: milestone.color,
                        reason: 'Rôle de niveau GuessTheCar',
                        mentionable: false,
                        hoist: true // Afficher séparément dans la liste des membres
                    });
                    logger.info(`Created level role: ${roleName}`);
                }
            }

        } catch (error) {
            logger.error('Error ensuring roles exist:', error);
        }
    }

    /**
     * Nettoie les rôles obsolètes du bot sur un serveur
     */
    async cleanupRoles(guild) {
        try {
            // Liste de tous les noms de rôles valides
            const validRoleNames = [
                ...Object.values(this.prestigeRoles).map(p => p.name),
                ...this.levelMilestones.map(m => m.name)
            ];

            // Chercher les anciens rôles avec le préfixe [GuessTheCar]
            const oldPrefixRoles = guild.roles.cache.filter(role =>
                role.name.startsWith('[GuessTheCar]')
            );

            // Supprimer les anciens rôles avec préfixe
            for (const role of oldPrefixRoles.values()) {
                await role.delete('Migration: suppression ancien format de rôle');
                logger.info(`Deleted old prefixed role: ${role.name}`);
            }

            // Vérifier les rôles actuels
            for (const role of guild.roles.cache.values()) {
                // Si c'est un rôle GuessTheCar mais pas dans la liste valide
                if (validRoleNames.includes(role.name)) {
                    continue; // Rôle valide, on garde
                }

                // Vérifier si c'est un ancien rôle GuessTheCar à supprimer
                const isOldGuessTheCarRole =
                    role.name.includes('Normal') ||
                    role.name.includes('Bronze') ||
                    role.name.includes('Argent') ||
                    role.name.includes('Or') ||
                    role.name.includes('Diamant') ||
                    role.name.includes('Maître') ||
                    role.name.includes('LÉGENDE') ||
                    role.name.includes('Niveau');

                if (isOldGuessTheCarRole && !validRoleNames.includes(role.name)) {
                    await role.delete('Rôle GuessTheCar obsolète');
                    logger.info(`Deleted obsolete role: ${role.name}`);
                }
            }

        } catch (error) {
            logger.error('Error cleaning up roles:', error);
        }
    }
}

module.exports = new RoleManager();
