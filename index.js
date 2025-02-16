require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds
    ]
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const activeGames = new Map();
const userScores = loadScores();

function loadScores() {
    if (!fs.existsSync('scores.json')) {
        fs.writeFileSync('scores.json', '{}', 'utf8');
        console.log('Fichier scores.json créé avec succès');
        return {};
    }

    try {
        const data = fs.readFileSync('scores.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors du chargement des scores:', error);
        fs.writeFileSync('scores.json', '{}', 'utf8');
        return {};
    }
}

function saveScores() {
    try {
        fs.writeFileSync('scores.json', JSON.stringify(userScores, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des scores:', error);
    }
}

function calculateTotalScore(player) {
    return (player.carsGuessed || 0) + ((player.partialGuesses || 0) * 0.5);
}

function updateScore(userId, username, fullSuccess) {
    if (!userScores[userId]) {
        userScores[userId] = {
            username: username,
            carsGuessed: 0,
            totalAttempts: 0,
            bestTime: null,
            partialGuesses: 0
        };
    }
    
    if (fullSuccess) {
        userScores[userId].carsGuessed += 1;
    } else {
        userScores[userId].partialGuesses += 1;
    }
    
    userScores[userId].username = username;
    saveScores();
}

function updateGameStats(userId, attempts, time) {
    if (userScores[userId]) {
        userScores[userId].totalAttempts += attempts;
        if (!userScores[userId].bestTime || time < userScores[userId].bestTime) {
            userScores[userId].bestTime = time;
        }
        saveScores();
    }
}

function getLeaderboard() {
    const players = Object.entries(userScores).map(([userId, data]) => ({
        userId,
        ...data,
        totalScore: calculateTotalScore(data)
    }));

    return players
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10)
        .map(player => ({
            username: player.username,
            carsGuessed: player.carsGuessed || 0,
            partialGuesses: player.partialGuesses || 0,
            totalScore: player.totalScore,
            averageAttempts: player.totalAttempts / (player.carsGuessed + player.partialGuesses) || 0,
            bestTime: player.bestTime
        }));
}

async function getAllMakes() {
    try {
        const response = await axios.get('https://www.carqueryapi.com/api/0.3/?cmd=getMakes');
        return response.data.Makes;
    } catch (error) {
        console.error('Erreur lors de la récupération des marques:', error);
        return null;
    }
}

async function getModelsForMake(make) {
    try {
        const response = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make}`);
        return response.data.Models;
    } catch (error) {
        console.error(`Erreur lors de la récupération des modèles pour ${make}:`, error);
        return null;
    }
}

async function getRandomCar() {
    try {
        const makes = await getAllMakes();
        if (!makes || makes.length === 0) {
            throw new Error('Aucune marque disponible');
        }

        const randomMake = makes[Math.floor(Math.random() * makes.length)];
        const models = await getModelsForMake(randomMake.make_id);
        if (!models || models.length === 0) {
            throw new Error(`Aucun modèle disponible pour ${randomMake.make_display}`);
        }

        const randomModel = models[Math.floor(Math.random() * models.length)];

        return {
            make: randomMake.make_display,
            model: randomModel.model_name,
            makeId: randomMake.make_id,
            country: randomMake.make_country,
            isCommon: randomMake.make_is_common === "1",
            modelLength: randomModel.model_name.length,
            makeLength: randomMake.make_display.length,
            firstLetter: randomMake.make_display[0],
            modelFirstLetter: randomModel.model_name[0]
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return null;
    }
}

async function registerCommands() {
    try {
        console.log('Enregistrement des commandes Slash...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {
                body: [
                    {
                        name: 'guesscar',
                        description: 'Démarre une nouvelle partie de devine la voiture.',
                        type: 1,
                    },
                    {
                        name: 'abandon',
                        description: 'Abandonne la partie en cours.',
                        type: 1,
                    },
                    {
                        name: 'classement',
                        description: 'Affiche le classement des joueurs.',
                        type: 1,
                    },
                    {
                        name: 'stats',
                        description: 'Affiche vos statistiques personnelles.',
                        type: 1,
                    }
                ]
            }
        );
        console.log('Commandes Slash enregistrées avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des commandes Slash:', error);
    }
}

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    registerCommands();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, channelId, user } = interaction;

    if (commandName === 'guesscar') {
        if (activeGames.has(channelId)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Partie déjà en cours')
                .setDescription('Une partie est déjà en cours dans ce canal !');
            await interaction.reply({ embeds: [embed] });
            return;
        }

        await interaction.reply('🎮 Recherche d\'une voiture...');

        const car = await getRandomCar();
        if (!car) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Désolé, une erreur est survenue lors de la récupération de la voiture. Réessayez !');
            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        }

        activeGames.set(channelId, {
            ...car,
            step: 'make',
            hintsUsed: 0,
            modelHintsUsed: 0,
            attempts: 0,
            startTime: Date.now(),
            userId: user.id,
            makeFailed: false
        });

        const gameStartEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🚗 Nouvelle partie')
            .setDescription('C\'est parti ! Devine la **marque** de la voiture.\nTape `!indice` pour obtenir des indices.\nTu as 10 essais maximum !')
            .setFooter({ text: 'Bonne chance !' });

        await interaction.followUp({ embeds: [gameStartEmbed] });

    } else if (commandName === 'abandon') {
        const game = activeGames.get(channelId);
        if (!game || game.userId !== user.id) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Aucune partie en cours')
                .setDescription('Aucune partie en cours que vous pouvez abandonner.');
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const abandonEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🏳️ Partie abandonnée')
            .setDescription(`La voiture était : ${game.make} ${game.model}`);
        await interaction.reply({ embeds: [abandonEmbed] });
        activeGames.delete(channelId);

    } else if (commandName === 'classement') {
        const leaderboard = getLeaderboard();
        const leaderboardEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Classement des meilleurs joueurs')
            .setDescription(
                leaderboard.map((player, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮';
                    const avgAttempts = player.averageAttempts.toFixed(1);
                    const bestTime = player.bestTime ? `${(player.bestTime / 1000).toFixed(1)}s` : 'N/A';
                    
                    return `${medal} **${index + 1}.** ${player.username}\n` +
                           `Points: ${player.totalScore.toFixed(1)} (${player.carsGuessed} complètes + ${player.partialGuesses} partielles)\n` +
                           `Moyenne: ${avgAttempts} essais | Meilleur temps: ${bestTime}\n`;
                }).join('\n')
            );
        
        await interaction.reply({ embeds: [leaderboardEmbed] });

    } else if (commandName === 'stats') {
        const stats = userScores[user.id];
        if (!stats) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Aucune statistique')
                .setDescription('Vous n\'avez pas encore joué !');
            await interaction.reply({ embeds: [embed] });
            return;
        }

        const totalScore = calculateTotalScore(stats);
        const avgAttempts = stats.totalAttempts / (stats.carsGuessed + stats.partialGuesses) || 0;
        const bestTime = stats.bestTime ? `${(stats.bestTime / 1000).toFixed(1)} secondes` : 'N/A';

        const statsEmbed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle(`📊 Statistiques de ${user.username}`)
            .addFields(
                { name: '🏆 Score total', value: `${totalScore.toFixed(1)} points`, inline: true },
                { name: '✨ Réussites complètes', value: `${stats.carsGuessed}`, inline: true },
                { name: '⭐ Réussites partielles', value: `${stats.partialGuesses}`, inline: true },
                { name: '🎯 Moyenne d\'essais', value: `${avgAttempts.toFixed(1)}`, inline: true },
                { name: '⚡ Meilleur temps', value: bestTime, inline: true }
            );

        await interaction.reply({ embeds: [statsEmbed] });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const game = activeGames.get(message.channelId);
    if (!game || game.userId !== message.author.id) return;

    const userAnswer = message.content.toLowerCase().trim();

    if (userAnswer === '!indice') {
        let hintDescription = '';
        if (game.step === 'make') {
            hintDescription = `🌍 Pays d'origine: ${game.country}\n📏 La marque contient ${game.makeLength} lettres`;
        } else {
            hintDescription = `📏 Le modèle contient ${game.modelLength} lettres / chiffres`;
        }

        const hintEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('💡 Indice')
            .setDescription(hintDescription);
        await message.reply({ embeds: [hintEmbed] });
        return;
    }

    game.attempts++;

    if (game.step === 'make') {
        let hintMessage = '';
        if (game.attempts === 5) {
            hintMessage = `\n💡 La marque commence par "${game.firstLetter}"`;
        }

        if (userAnswer === game.make.toLowerCase()) {
            game.step = 'model';
            game.attempts = 0;
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Marque trouvée !')
                .setDescription(`C'est bien ${game.make} !\nMaintenant, devine le **modèle** de cette voiture.`);
            await message.reply({ embeds: [successEmbed] });
        } else {
            if (game.attempts >= 10) {
                game.makeFailed = true;
                game.step = 'model';
                game.attempts = 0;
                const failedEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⌛ Plus d\'essais')
                    .setDescription(`La marque était: **${game.make}**\nOn passe au modèle !`);
                await message.reply({ embeds: [failedEmbed] });
            } else {
                const wrongEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Mauvaise réponse')
                    .setDescription(`Ce n'est pas la bonne marque, essaie encore ! (${10 - game.attempts} essais restants)${hintMessage}`);
                await message.reply({ embeds: [wrongEmbed] });
            }
        }
    } else if (game.step === 'model') {
        let hintMessage = '';
        if (game.attempts === 5) {
            hintMessage = `\n💡 Le modèle commence par "${game.modelFirstLetter}"`;
        } else if (game.attempts === 7) {
            const lastLetter = game.model[game.model.length - 1];
            hintMessage = `\n💡 Le modèle se termine par "${lastLetter}"`;
        }

        if (userAnswer === game.model.toLowerCase()) {
            const timeSpent = Date.now() - game.startTime;
            const fullSuccess = !game.makeFailed;
            
            updateScore(message.author.id, message.author.username, fullSuccess);
            updateGameStats(message.author.id, game.attempts, timeSpent);

            const timeInSeconds = (timeSpent / 1000).toFixed(1);
            const userScore = userScores[message.author.id];
            const totalScore = calculateTotalScore(userScore);

            const winEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎉 Félicitations !')
                .setDescription(`Tu as deviné la voiture : ${game.make} ${game.model}`)
                .addFields(
                    { name: '⏱️ Temps', value: `${timeInSeconds} secondes`, inline: true },
                    { name: '🎯 Nombre d\'essais', value: `${game.attempts}`, inline: true },
                    { name: fullSuccess ? '🌟 Réussite' : '⭐ Réussite partielle', 
                      value: fullSuccess ? 'Point complet obtenu !' : 'Demi-point obtenu (marque trouvée avec aide)', 
                      inline: true },
                    { name: '🏆 Score total', value: `${totalScore.toFixed(1)} points` }
                );

            await message.reply({ embeds: [winEmbed] });
            activeGames.delete(message.channelId);
        } else {
            if (game.attempts >= 10) {
                const timeSpent = Date.now() - game.startTime;
                updateScore(message.author.id, message.author.username, false);
                updateGameStats(message.author.id, game.attempts, timeSpent);
                
                const gameOverEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⌛ Plus d\'essais')
                    .setDescription(`Le modèle était: **${game.model}**\nVous gagnez un demi-point pour avoir trouvé la marque.`);

                await message.reply({ embeds: [gameOverEmbed] });
                activeGames.delete(message.channelId);
            } else {
                const wrongModelEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Mauvaise réponse')
                    .setDescription(`Ce n'est pas le bon modèle, essaie encore ! (${10 - game.attempts} essais restants)${hintMessage}`);

                await message.reply({ embeds: [wrongModelEmbed] });
            }
        }
    }
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