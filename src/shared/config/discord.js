const { GatewayIntentBits } = require('discord.js');

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    officialGuildId: process.env.OFFICIAL_GUILD_ID, // ID du serveur officiel pour la gestion des rôles
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // Requis pour la gestion des rôles
    ],
    restVersion: '10'
};
