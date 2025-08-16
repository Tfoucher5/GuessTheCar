const fs = require('fs');
const path = require('path');
const { REST, Routes, MessageFlags } = require('discord.js');
const discordConfig = require('../../shared/config/discord');
const logger = require('../../shared/utils/logger');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.commandsData = [];
        this.rest = new REST({ version: discordConfig.restVersion }).setToken(discordConfig.token);
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');

        if (!fs.existsSync(commandsPath)) {
            logger.warn('Commands directory not found');
            return;
        }

        this.loadCommandsFromDirectory(commandsPath);
        logger.info(`Loaded ${this.commands.size} commands`);
    }

    loadCommandsFromDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                this.loadCommandsFromDirectory(itemPath);
            } else if (item.endsWith('.js')) {
                try {
                    const command = require(itemPath);

                    if (command?.data && command?.execute) {
                        if (!this.commands.has(command.data.name)) {
                            this.commands.set(command.data.name, command);
                            this.commandsData.push(command.data.toJSON());
                            logger.info(`Command loaded: ${command.data.name}`);
                        } else {
                            logger.warn(`Duplicate command name skipped: ${command.data.name}`);
                        }
                    } else {
                        logger.warn(`Invalid command file (missing data or execute): ${itemPath}`);
                    }
                } catch (error) {
                    logger.error(`Failed to load command ${itemPath}:`, error);
                }
            }
        }
    }

    async registerCommands(client) {
        try {
            logger.info('Refreshing application (/) commands...');
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

    getCommand(name) {
        return this.commands.get(name);
    }

    getAllCommands() {
        return Array.from(this.commands.values());
    }

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
                flags: MessageFlags.Ephemeral
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
