require('dotenv').config();
const { Client, GatewayIntentBits, REST } = require('discord.js');
const CommandHandler = require('./handlers/CommandHandler');
const GameManager = require('./managers/GameManager');
const ScoreManager = require('./services/ScoreManager');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const commandHandler = new CommandHandler(rest, process.env.CLIENT_ID);
const scoreManager = new ScoreManager();
const gameManager = new GameManager(client, scoreManager);

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    commandHandler.registerCommands();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    await gameManager.handleCommand(interaction);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    await gameManager.handleMessage(message);
});

client.on('error', error => {
    console.error('Erreur Discord:', error);
});

process.on('unhandledRejection', error => {
    console.error('Erreur non gérée:', error);
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Erreur de connexion:', error);
});