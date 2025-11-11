const { GatewayIntentBits } = require('discord.js');

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    restVersion: '10'
};
