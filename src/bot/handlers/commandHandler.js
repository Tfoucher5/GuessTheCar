// src/bot/handlers/commandHandler.js
const fs = require('fs').promises;
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const logger = require('../../shared/utils/logger');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
        this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    }

    async loadCommands() {
        try {
            const commandsPath = path.join(__dirname, '../commands');
            const commandCategories = await fs.readdir(commandsPath);

            for (const category of commandCategories) {
                const categoryPath = path.join(commandsPath, category);
                const stat = await fs.stat(categoryPath);

                if (!stat.isDirectory()) continue;

                const commandFiles = await fs.readdir(categoryPath);
                const jsFiles = commandFiles.filter(file => file.endsWith('.js'));

                for (const file of jsFiles) {
                    try {
                        const filePath = path.join(categoryPath, file);

                        // Supprimer du cache pour permettre le rechargement
                        delete require.cache[require.resolve(filePath)];

                        const command = require(filePath);

                        // Validation de la commande
                        if (!command.data || !command.execute) {
                            logger.warn(`Command ${file} is missing required 'data' or 'execute' property`);
                            continue;
                        }

                        // Vérifier les doublons
                        if (this.commands.has(command.data.name)) {
                            logger.warn(`Duplicate command found: ${command.data.name} in ${file}. Skipping...`);
                            continue;
                        }

                        this.commands.set(command.data.name, command);
                        logger.debug(`Loaded command: ${command.data.name} from ${category}/${file}`);

                    } catch (error) {
                        logger.error(`Error loading command ${file}:`, error);
                    }
                }
            }

            logger.info(`Loaded ${this.commands.size} commands`);
            return this.commands.size;

        } catch (error) {
            logger.error('Error loading commands:', error);
            throw error;
        }
    }

    async registerCommands() {
        try {
            // Convertir la Map en Array et éliminer les doublons
            const commandsArray = Array.from(this.commands.values());
            const uniqueCommands = [];
            const seenNames = new Set();

            for (const command of commandsArray) {
                if (!seenNames.has(command.data.name)) {
                    seenNames.add(command.data.name);
                    uniqueCommands.push(command.data.toJSON());
                } else {
                    logger.warn(`Skipping duplicate command: ${command.data.name}`);
                }
            }

            logger.info(`Registering ${uniqueCommands.length} unique commands with Discord...`);

            // Enregistrer les commandes
            await this.rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: uniqueCommands }
            );

            logger.info(`✅ Successfully registered ${uniqueCommands.length} application commands`);

        } catch (error) {
            logger.error('Error registering commands:', error.message, {
                code: error.code,
                status: error.status,
                method: error.method,
                url: error.url,
                requestBody: error.requestBody
            });
            throw error;
        }
    }

    async executeCommand(interaction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            logger.info('Command executed:', {
                command: interaction.commandName,
                user: interaction.user.username,
                guild: interaction.guild?.name || 'DM'
            });

            await command.execute(interaction);

        } catch (error) {
            logger.error(`Error executing command ${interaction.commandName}:`, error);

            const errorMessage = 'Une erreur est survenue lors de l\'exécution de cette commande.';

            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({
                        content: errorMessage,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: errorMessage,
                        ephemeral: true
                    });
                }
            } catch (replyError) {
                logger.error('Error sending error message:', replyError);
            }
        }
    }

    getCommand(name) {
        return this.commands.get(name);
    }

    getAllCommands() {
        return Array.from(this.commands.values());
    }

    async reloadCommand(commandName) {
        try {
            // Trouver le fichier de la commande
            const commandsPath = path.join(__dirname, '../commands');
            const commandCategories = await fs.readdir(commandsPath);

            for (const category of commandCategories) {
                const categoryPath = path.join(commandsPath, category);
                const stat = await fs.stat(categoryPath);

                if (!stat.isDirectory()) continue;

                const commandFiles = await fs.readdir(categoryPath);

                for (const file of commandFiles.filter(f => f.endsWith('.js'))) {
                    const filePath = path.join(categoryPath, file);

                    // Supprimer du cache
                    delete require.cache[require.resolve(filePath)];

                    const command = require(filePath);

                    if (command.data && command.data.name === commandName) {
                        this.commands.set(commandName, command);
                        logger.info(`Reloaded command: ${commandName}`);
                        return true;
                    }
                }
            }

            logger.warn(`Command ${commandName} not found for reload`);
            return false;

        } catch (error) {
            logger.error(`Error reloading command ${commandName}:`, error);
            return false;
        }
    }

    async clearCommands() {
        try {
            logger.info('Clearing all application commands...');

            await this.rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: [] }
            );

            logger.info('✅ Successfully cleared all application commands');

        } catch (error) {
            logger.error('Error clearing commands:', error);
            throw error;
        }
    }
}

module.exports = CommandHandler;
