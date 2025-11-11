// src/bot/handlers/CommandHandler.js

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../../shared/utils/logger');
const statsHelper = require('../../shared/utils/StatsHelper');
const supabaseCommandLogger = require('../../shared/utils/supabaseCommandLogger');

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
            // Logger la commande dans Supabase ET dans l'API Node.js
            const commandName = interaction.commandName;
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const guildId = interaction.guild?.id || null;
            const guildName = interaction.guild?.name || 'DM';

            // Logger dans Supabase (async, on n'attend pas)
            supabaseCommandLogger.logCommand(commandName, userId, guildId).catch(err => {
                logger.error('Failed to log command to Supabase:', err);
            });

            // Logger dans l'API Node.js existante (pour compatibilité)
            statsHelper.logCommand(
                commandName,
                userId,
                username,
                guildId,
                guildName
            ).catch(err => {
                logger.error('Failed to log command to Node.js API:', err);
            });

            logger.info(`Command executed: ${commandName} by ${username} (${userId}) in ${guildName}`);

            // Exécuter la commande
            await command.execute(interaction);

        } catch (error) {
            logger.error(`Error executing command ${interaction.commandName}:`, {
                error: error.message,
                stack: error.stack,
                userId: interaction.user.id,
                guildId: interaction.guild?.id
            });

            const errorMessage = 'Une erreur est survenue lors de l\'exécution de cette commande.';

            try {
                if (interaction.replied || interaction.deferred) {
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
            } catch (followUpError) {
                logger.error('Failed to send error message to user:', followUpError);
            }

            // Logger l'erreur dans l'API
            statsHelper.logError(error, {
                command: interaction.commandName,
                user: interaction.user.id,
                guild: interaction.guild?.id
            }).catch(err => {
                logger.error('Failed to log error to API:', err);
            });
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
