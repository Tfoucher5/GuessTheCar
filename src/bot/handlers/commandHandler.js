// src/bot/handlers/CommandHandler.js

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../../shared/utils/logger');
const supabaseCommandLogger = require('../../shared/database/logging/supabaseCommandLogger');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');
        await this.loadCommandsFromDirectory(commandsPath);
        logger.info(`Loaded ${this.commands.size} commands`);
    }

    async loadCommandsFromDirectory(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await this.loadCommandsFromDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                try {
                    const command = require(fullPath);

                    if (!command.data || !command.execute) {
                        logger.warn(`Command at ${fullPath} is missing required "data" or "execute" property`);
                        continue;
                    }

                    this.commands.set(command.data.name, command);
                    logger.debug(`Loaded command: ${command.data.name}`);

                } catch (error) {
                    logger.error(`Error loading command at ${fullPath}:`, error);
                }
            }
        }
    }

    async executeCommand(interaction) {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            // Logger la commande dans Supabase
            const commandName = interaction.commandName;
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const guildId = interaction.guild?.id || null;
            const guildName = interaction.guild?.name || 'DM';

            // Logger dans Supabase (async, on n'attend pas)
            supabaseCommandLogger.logCommand(commandName, userId, guildId).catch(err => {
                logger.error('Failed to log command to Supabase:', err);
            });

            logger.info(`Command executed: ${commandName} by ${username} (${userId}) in ${guildName}`);

            // Exécuter la commande
            await command.execute(interaction);

        } catch (error) {
            logger.error(`Error executing command ${interaction.commandName}:`, {
                error: error.message,
                stack: error.stack,
                userId: interaction.user.id,
                guildId: interaction.guild?.id,
                interactionState: {
                    replied: interaction.replied,
                    deferred: interaction.deferred
                }
            });

            const errorMessage = 'Une erreur est survenue lors de l\'exécution de cette commande.';

            try {
                // Ne pas envoyer de message d'erreur si la commande a déjà géré sa propre erreur
                if (interaction.replied) {
                    logger.debug('Interaction already replied - skipping error message');
                    return;
                }

                if (interaction.deferred) {
                    await interaction.editReply({
                        content: errorMessage
                    });
                } else {
                    await interaction.reply({
                        content: errorMessage,
                        ephemeral: true
                    });
                }
            } catch (followUpError) {
                logger.error('Failed to send error message to user:', {
                    error: followUpError.message,
                    interactionState: {
                        replied: interaction.replied,
                        deferred: interaction.deferred
                    }
                });
            }
        }
    }

    async registerCommands() {
        const { REST, Routes } = require('discord.js');
        const token = process.env.DISCORD_TOKEN;
        const clientId = process.env.DISCORD_CLIENT_ID;

        if (!token || !clientId) {
            logger.error('DISCORD_TOKEN or DISCORD_CLIENT_ID missing in environment variables');
            return;
        }

        const rest = new REST({ version: '10' }).setToken(token);

        try {
            const commandsData = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());

            logger.info(`Started refreshing ${commandsData.length} application (/) commands.`);

            // Register commands globally (works in all guilds)
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commandsData }
            );

            logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            logger.error('Error registering commands:', error);
        }
    }

    getCommandsList() {
        return Array.from(this.commands.values()).map(cmd => ({
            name: cmd.data.name,
            description: cmd.data.description
        }));
    }
}

module.exports = CommandHandler;
