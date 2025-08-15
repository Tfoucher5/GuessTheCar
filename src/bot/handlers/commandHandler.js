const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const discordConfig = require('../../shared/config/discord');
const logger = require('../../shared/utils/logger');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.commandsData = [];
        this.rest = new REST({ version: discordConfig.restVersion }).setToken(discordConfig.token);
    }

    /**
     * Charge toutes les commandes depuis les dossiers
     */
    loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');

        if (!fs.existsSync(commandsPath)) {
            logger.warn('Commands directory not found');
            return;
        }

        this.loadCommandsFromDirectory(commandsPath);
        logger.info(`Loaded ${this.commands.size} commands`);
    }

    /**
     * Charge les commandes récursivement depuis un dossier
     */
    loadCommandsFromDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                // Récursion dans les sous-dossiers
                this.loadCommandsFromDirectory(itemPath);
            } else if (item.endsWith('.js')) {
                try {
                    const command = require(itemPath);

                    if (command.data && command.execute) {
                        this.commands.set(command.data.name, command);
                        this.commandsData.push(command.data.toJSON());
                        logger.debug(`Command loaded: ${command.data.name}`);
                    } else {
                        logger.warn(`Invalid command file: ${item}`);
                    }
                } catch (error) {
                    logger.error(`Error loading command ${item}:`, error);
                }
            }
        }
    }

    /**
     * Enregistre les commandes slash sur Discord
     */
    async registerCommands(client) {
        try {
            logger.info('Started refreshing application (/) commands.');

            await this.rest.put(
                Routes.applicationCommands(client.user.id),
                { body: this.commandsData }
            );

            logger.info('Successfully reloaded application (/) commands.');
        } catch (error) {
            logger.error('Error registering commands:', error);
            throw error;
        }
    }

    /**
     * Obtient une commande par nom
     */
    getCommand(name) {
        return this.commands.get(name);
    }

    /**
     * Obtient toutes les commandes
     */
    getAllCommands() {
        return Array.from(this.commands.values());
    }

    /**
     * Exécute une commande
     */
    async executeCommand(interaction) {
        const command = this.getCommand(interaction.commandName);

        if (!command) {
            logger.warn(`Command not found: ${interaction.commandName}`);
            return false;
        }

        try {
            await command.execute(interaction);

            logger.info('Command executed:', {
                command: interaction.commandName,
                user: interaction.user.tag,
                guild: interaction.guild?.name || 'DM'
            });

            return true;
        } catch (error) {
            logger.error(`Error executing command ${interaction.commandName}:`, error);

            const errorMessage = {
                content: 'Une erreur est survenue lors de l\'exécution de cette commande.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }

            return false;
        }
    }
}

module.exports = new CommandHandler();
