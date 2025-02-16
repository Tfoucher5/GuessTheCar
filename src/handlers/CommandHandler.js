const { Routes } = require('discord.js');
const commands = require('../commands');

class CommandHandler {
    constructor(rest, clientId) {
        this.rest = rest;
        this.clientId = clientId;
    }

    async registerCommands() {
        try {
            console.log('Enregistrement des commandes Slash...');
            await this.rest.put(
                Routes.applicationCommands(this.clientId),
                { body: commands }
            );
            console.log('Commandes Slash enregistrées avec succès.');
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement des commandes Slash:', error);
        }
    }
}

module.exports = CommandHandler;