const logger = require('../../shared/utils/logger');

/**
 * Gestionnaire de rôles Discord basé sur le niveau et le prestige
 */
class RoleManager {
    constructor() {
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
        this.levelMilestones = [
            { level: 5, name: 'Niveau 5+', color: '#95A5A6' },
            { level: 10, name: 'Niveau 10+', color: '#3498DB' },
            { level: 15, name: 'Niveau 15+', color: '#9B59B6' },
            { level: 20, name: 'Niveau 20 (Max)', color: '#E74C3C' }
        ];

        // Préfixe pour identifier les rôles gérés par le bot
        this.rolePrefix = '[GuessTheCar]';
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
     * Met à jour le rôle de prestige d'un membre
     */
    async updatePrestigeRole(guild, member, prestigeLevel) {
        try {
            const prestigeConfig = this.prestigeRoles[prestigeLevel];
            if (!prestigeConfig) return;

            const targetRoleName = `${this.rolePrefix} ${prestigeConfig.name}`;

            // Retirer tous les anciens rôles de prestige
            const prestigeRolesToRemove = member.roles.cache.filter(role =>
                role.name.startsWith(`${this.rolePrefix} `) &&
                Object.values(this.prestigeRoles).some(p =>
                    role.name === `${this.rolePrefix} ${p.name}`
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
            const milestone = [...this.levelMilestones]
                .reverse()
                .find(m => level >= m.level);

            if (!milestone) return;

            const targetRoleName = `${this.rolePrefix} ${milestone.name}`;

            // Retirer tous les anciens rôles de niveau
            const levelRolesToRemove = member.roles.cache.filter(role =>
                role.name.startsWith(`${this.rolePrefix} Niveau `)
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
     */
    async ensureRolesExist(guild) {
        try {
            // Créer les rôles de prestige s'ils n'existent pas
            for (const [level, config] of Object.entries(this.prestigeRoles)) {
                const roleName = `${this.rolePrefix} ${config.name}`;
                const existingRole = guild.roles.cache.find(r => r.name === roleName);

                if (!existingRole) {
                    await guild.roles.create({
                        name: roleName,
                        color: config.color,
                        reason: 'Rôle de prestige GuessTheCar',
                        mentionable: false
                    });
                    logger.info(`Created prestige role: ${roleName}`);
                }
            }

            // Créer les rôles de niveau s'ils n'existent pas
            for (const milestone of this.levelMilestones) {
                const roleName = `${this.rolePrefix} ${milestone.name}`;
                const existingRole = guild.roles.cache.find(r => r.name === roleName);

                if (!existingRole) {
                    await guild.roles.create({
                        name: roleName,
                        color: milestone.color,
                        reason: 'Rôle de niveau GuessTheCar',
                        mentionable: false
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
            const botRoles = guild.roles.cache.filter(role =>
                role.name.startsWith(this.rolePrefix)
            );

            for (const role of botRoles.values()) {
                // Vérifier si le rôle est encore valide
                const isValidPrestigeRole = Object.values(this.prestigeRoles).some(p =>
                    role.name === `${this.rolePrefix} ${p.name}`
                );
                const isValidLevelRole = this.levelMilestones.some(m =>
                    role.name === `${this.rolePrefix} ${m.name}`
                );

                // Si le rôle n'est plus valide, le supprimer
                if (!isValidPrestigeRole && !isValidLevelRole) {
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
