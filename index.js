require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, ChannelType } = require('discord.js');
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
const GAME_TIMEOUT = 300000;
const dailyChallenge = {
    car: null,
    date: null,
    players: new Map(),
    resetTime: null
};

const duels = new Map();
const timeTrials = new Map();

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

function createGameEmbed(game, message) {
    return new EmbedBuilder()
        .setColor(message.color || '#00FF00')
        .setTitle(message.title)
        .setDescription(message.description)
        .setFooter({ 
            text: `Partie de ${game.playerName} | Essais: ${game.attempts}/10${message.footer ? ' | ' + message.footer : ''}`
        });
}

function loadStreaks() {
    if (!fs.existsSync('streaks.json')) {
        fs.writeFileSync('streaks.json', '{}', 'utf8');
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync('streaks.json', 'utf8'));
    } catch (error) {
        console.error('Erreur lors du chargement des streaks:', error);
        return {};
    }
}

const userStreaks = loadStreaks();

function saveStreaks() {
    fs.writeFileSync('streaks.json', JSON.stringify(userStreaks, null, 2));
}

function updateStreak(userId) {
    if (!userStreaks[userId]) {
        userStreaks[userId] = {
            current: 1,
            best: 1,
            lastPlayed: Date.now()
        };
    } else {
        const lastPlayed = new Date(userStreaks[userId].lastPlayed);
        const now = new Date();
        // Réinitialiser si plus de 24h entre les parties
        if (now - lastPlayed > 24 * 60 * 60 * 1000) {
            userStreaks[userId].current = 1;
        } else {
            userStreaks[userId].current++;
            if (userStreaks[userId].current > userStreaks[userId].best) {
                userStreaks[userId].best = userStreaks[userId].current;
            }
        }
        userStreaks[userId].lastPlayed = now.getTime();
    }
    saveStreaks();
}

async function handleGameTimeout(threadId, game) {
    const thread = await client.channels.fetch(threadId);
    if (thread && activeGames.has(threadId)) {
        const timeoutEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⏰ Temps écoulé')
            .setDescription(`La partie a été abandonnée après 5 minutes d'inactivité.\nLa voiture était: ${game.make} ${game.model}`);
        
        await thread.send({ embeds: [timeoutEmbed] });
        await thread.setArchived(true);
        activeGames.delete(threadId);
    }
}

async function handleDuelTimeout(threadId) {
    const duel = duels.get(threadId);
    if (!duel) return;

    const thread = await client.channels.fetch(threadId);
    if (!thread) return;

    const timeoutEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('⏰ Duel terminé')
        .setDescription('Le duel a été abandonné après 5 minutes d\'inactivité.\n' +
                       `La voiture était: ${duel.car.make} ${duel.car.model}`);

    await thread.send({ embeds: [timeoutEmbed] });
    await thread.setArchived(true);
    duels.delete(threadId);
}

async function handleTimeTrialEnd(userId, threadId) {
    const timeTrial = timeTrials.get(userId);
    if (!timeTrial || !timeTrial.active) return;

    const thread = await client.channels.fetch(threadId);
    if (!thread) return;

    timeTrial.active = false;
    const totalCars = timeTrial.cars.length;
    const successfulCars = timeTrial.cars.filter(car => car.success).length;

    const resultsEmbed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('🏁 Contre-la-montre terminé !')
        .setDescription(`Résultats de la session:`)
        .addFields(
            { name: '🚗 Voitures trouvées', value: `${successfulCars}/${totalCars}`, inline: true },
            { name: '⭐ Score', value: `${successfulCars * 2} points`, inline: true },
            { name: '🏆 Meilleur temps', value: timeTrial.cars.length > 0 ? 
                `${Math.min(...timeTrial.cars.map(c => c.time))}s` : 'N/A', inline: true }
        );

    await thread.send({ embeds: [resultsEmbed] });
    await thread.setArchived(true);
    timeTrials.delete(userId);
    activeGames.delete(threadId);
}

async function resetDailyChallenge() {
    const car = await getRandomCar();
    if (!car) return null;

    dailyChallenge.car = car;
    dailyChallenge.date = new Date().toDateString();
    dailyChallenge.players.clear();
    dailyChallenge.resetTime = new Date().setHours(24, 0, 0, 0);

    // Planifier le prochain reset
    const now = new Date().getTime();
    setTimeout(resetDailyChallenge, dailyChallenge.resetTime - now);

    return car;
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
                    },
                    {
                        name: 'aide',
                        description: 'Affiche les règles du jeu et les commandes disponibles.',
                        type: 1,
                    },
                    {
                        name: 'daily',
                        description: 'Participe au challenge quotidien.',
                        type: 1,
                    },
                    {
                        name: 'duel',
                        description: 'Défie un autre joueur.',
                        type: 1,
                        options: [{
                            name: 'adversaire',
                            type: 6, // USER type
                            description: 'Le joueur que tu veux défier',
                            required: true
                        }]
                    },
                    {
                        name: 'timetrial',
                        description: 'Lance une partie contre-la-montre (5 minutes).',
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
    resetDailyChallenge();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const duel = duels.get(message.channelId);
    if (duel) {
        const player = duel.players.find(p => p.id === message.author.id);
        if (!player) return;

        clearTimeout(duel.timeoutId);
        duel.timeoutId = setTimeout(() => handleDuelTimeout(message.channelId), GAME_TIMEOUT);

        const userAnswer = message.content.toLowerCase().trim();

        if (userAnswer === '!indice') {
            let hintDescription = '';
            if (player.step === 'make') {
                hintDescription = `🌍 Pays d'origine: ${duel.car.country}\n📏 La marque contient ${duel.car.makeLength} lettres`;
            } else {
                hintDescription = `📏 Le modèle contient ${duel.car.modelLength} lettres / chiffres`;
            }

            const hintEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('💡 Indice')
                .setDescription(hintDescription)
                .setFooter({ text: `Duel: ${player.name} | Essais: ${player.attempts}/10` });

            await message.reply({ embeds: [hintEmbed] });
            return;
        }

        player.attempts++;
        if (!player.startTime) {
            player.startTime = Date.now();
        }

        if (player.step === 'make') {
            let hintMessage = '';
            if (player.attempts === 5) {
                hintMessage = `\n💡 La marque commence par "${duel.car.firstLetter}"`;
            }

            if (userAnswer === duel.car.make.toLowerCase()) {
                player.step = 'model';
                player.attempts = 0;
                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Marque trouvée !')
                    .setDescription(`C'est bien ${duel.car.make} !\nMaintenant, devine le **modèle** de cette voiture.`)
                    .setFooter({ text: `Duel: ${player.name}` });

                await message.reply({ embeds: [successEmbed] });
            } else {
                if (player.attempts >= 10) {
                    player.makeFailed = true;
                    player.step = 'model';
                    player.attempts = 0;
                    const failedEmbed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('⌛ Plus d\'essais')
                        .setDescription(`La marque était: **${duel.car.make}**\nOn passe au modèle !`)
                        .setFooter({ text: `Duel: ${player.name}` });

                    await message.reply({ embeds: [failedEmbed] });
                } else {
                    const wrongEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Mauvaise réponse')
                        .setDescription(`Ce n'est pas la bonne marque, essaie encore ! (${10 - player.attempts} essais restants)${hintMessage}`)
                        .setFooter({ text: `Duel: ${player.name}` });

                    await message.reply({ embeds: [wrongEmbed] });
                }
            }
        } else if (player.step === 'model') {
            if (userAnswer === duel.car.model.toLowerCase()) {
                const timeSpent = Date.now() - player.startTime;
                const opponent = duel.players.find(p => p.id !== player.id);
                const fullSuccess = !player.makeFailed;
                
                updateScore(message.author.id, message.author.username, fullSuccess);
                updateGameStats(message.author.id, player.attempts, timeSpent);

                const timeInSeconds = (timeSpent / 1000).toFixed(1);
                
                let winDescription = `🎉 ${player.name} a gagné le duel en ${timeInSeconds} secondes !`;
                if (opponent.step === 'model') {
                    winDescription += `\n${opponent.name} était aussi au modèle !`;
                }

                const winEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('⚔️ Duel terminé !')
                    .setDescription(winDescription)
                    .addFields(
                        { name: '🚗 Voiture', value: `${duel.car.make} ${duel.car.model}`, inline: true },
                        { name: '⏱️ Temps', value: `${timeInSeconds}s`, inline: true },
                        { name: '🎯 Essais', value: `${player.attempts}`, inline: true }
                    );

                await message.reply({ embeds: [winEmbed] });
                await message.channel.setArchived(true);
                duels.delete(message.channelId);
            } else {
                if (player.attempts >= 10) {
                    const timeSpent = Date.now() - player.startTime;
                    const opponent = duel.players.find(p => p.id !== player.id);
                    
                    updateScore(message.author.id, message.author.username, false);
                    updateGameStats(message.author.id, player.attempts, timeSpent);

                    const gameOverEmbed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('⌛ Plus d\'essais')
                        .setDescription(`${player.name} n'a pas trouvé le modèle !\nC'était: **${duel.car.model}**\n${opponent.name} gagne le duel !`);

                    await message.reply({ embeds: [gameOverEmbed] });
                    await message.channel.setArchived(true);
                    duels.delete(message.channelId);
                } else {
                    const wrongModelEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Mauvaise réponse')
                        .setDescription(`Ce n'est pas le bon modèle, essaie encore ! (${10 - player.attempts} essais restants)`)
                        .setFooter({ text: `Duel: ${player.name}` });

                    await message.reply({ embeds: [wrongModelEmbed] });
                }
            }
        }
        return;
    }

    // Gérer le mode contre-la-montre
    const game = activeGames.get(message.channelId);
    if (game && game.isTimetrial) {
        const timeTrial = timeTrials.get(message.author.id);
        if (!timeTrial || !timeTrial.active) return;

        const userAnswer = message.content.toLowerCase().trim();
        const remainingTime = Math.max(0, Math.floor((timeTrial.startTime + 5 * 60 * 1000 - Date.now()) / 1000));
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        if (userAnswer === '!indice') {
            let hintDescription = '';
            if (game.step === 'make') {
                hintDescription = `🌍 Pays d'origine: ${game.country}\n📏 La marque contient ${game.makeLength} lettres`;
            } else {
                hintDescription = `📏 Le modèle contient ${game.modelLength} lettres / chiffres`;
            }

            const hintEmbed = createGameEmbed(game, {
                color: '#FFA500',
                title: '💡 Indice',
                description: hintDescription,
                footer: `Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`
            });
            
            await message.reply({ embeds: [hintEmbed] });
            return;
        }

        game.attempts++;

        if (game.step === 'make') {
            if (userAnswer === game.make.toLowerCase()) {
                game.step = 'model';
                game.attempts = 0;
                const successEmbed = createGameEmbed(game, {
                    title: '✅ Marque trouvée !',
                    description: `C'est bien ${game.make} !\nMaintenant, devine le **modèle** de cette voiture.`,
                    footer: `Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`
                });
                await message.reply({ embeds: [successEmbed] });
            } else {
                if (game.attempts >= 10) {
                    // Passer à la voiture suivante
                    const newCar = await getRandomCar();
                    Object.assign(game, newCar, {
                        step: 'make',
                        attempts: 0,
                        startTime: Date.now(),
                        makeFailed: false
                    });

                    const nextCarEmbed = createGameEmbed(game, {
                        color: '#FFA500',
                        title: '🔄 Nouvelle voiture',
                        description: 'Voiture suivante ! Devine la **marque**.',
                        footer: `Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`
                    });
                    await message.reply({ embeds: [nextCarEmbed] });
                } else {
                    const wrongEmbed = createGameEmbed(game, {
                        color: '#FF0000',
                        title: '❌ Mauvaise réponse',
                        description: `Ce n'est pas la bonne marque ! (${10 - game.attempts} essais restants)`,
                        footer: `Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`
                    });
                    await message.reply({ embeds: [wrongEmbed] });
                }
            }
        } else if (game.step === 'model') {
            if (userAnswer === game.model.toLowerCase()) {
                const timeSpent = Date.now() - game.startTime;
                timeTrial.cars.push({
                    make: game.make,
                    model: game.model,
                    time: timeSpent / 1000,
                    attempts: game.attempts,
                    success: true
                });

                // Passer à la voiture suivante
                const newCar = await getRandomCar();
                Object.assign(game, newCar, {
                    step: 'make',
                    attempts: 0,
                    startTime: Date.now(),
                    makeFailed: false
                });

                const successEmbed = createGameEmbed(game, {
                    title: '🎉 Voiture trouvée !',
                    description: `Bien joué ! C'était ${game.make} ${game.model}\nNouvelle voiture ! Devine la **marque**.`,
                    footer: `Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`
                });
                await message.reply({ embeds: [successEmbed] });
            } else {
                if (game.attempts >= 10) {
                    timeTrial.cars.push({
                        make: game.make,
                        model: game.model,
                        time: null,
                        attempts: game.attempts,
                        success: false
                    });

                    // Passer à la voiture suivante
                    const newCar = await getRandomCar();
                    Object.assign(game, newCar, {
                        step: 'make',
                        attempts: 0,
                        startTime: Date.now(),
                        makeFailed: false
                    });

                    const nextCarEmbed = createGameEmbed(game, {
                        color: '#FFA500',
                        title: '🔄 Nouvelle voiture',
                        description: `Le modèle était: **${game.model}**\nPassons à la voiture suivante ! Devine la **marque**.`,
                        footer: `Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`
                    });
                    await message.reply({ embeds: [nextCarEmbed] });
                } else {
                    const wrongModelEmbed = createGameEmbed(game, {
                        color: '#FF0000',
                        title: '❌ Mauvaise réponse',
                        description: `Ce n'est pas le bon modèle ! (${10 - game.attempts} essais restants)`,
                        footer: `Temps restant: ${minutes}:${seconds.toString().padStart(2, '0')}`
                    });
                    await message.reply({ embeds: [wrongModelEmbed] });
                }
            }
        }
        return;
    }
    
    const { commandName, user } = interaction;

    if (commandName === 'guesscar') {
        const existingGame = Array.from(activeGames.values()).find(game => game.userId === user.id);
        if (existingGame) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Partie déjà en cours')
                .setDescription('Vous avez déjà une partie en cours dans un autre fil !');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const car = await getRandomCar();
        if (!car) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erreur')
                .setDescription('Désolé, une erreur est survenue lors de la récupération de la voiture. Réessayez !');
            await interaction.followUp({ embeds: [errorEmbed] });
            return;
        }

        const thread = await interaction.channel.threads.create({
            name: `🚗 Partie de ${user.username}`,
            type: ChannelType.PrivateThread,
            autoArchiveDuration: 60
        });

        const game = {
            ...car,
            step: 'make',
            hintsUsed: 0,
            modelHintsUsed: 0,
            attempts: 0,
            startTime: Date.now(),
            userId: user.id,
            playerName: user.username,
            makeFailed: false,
            timeoutId: setTimeout(() => handleGameTimeout(thread.id, game), GAME_TIMEOUT)
        };

        activeGames.set(thread.id, game);

        const gameStartEmbed = createGameEmbed(game, {
            title: '🚗 Nouvelle partie',
            description: 'C\'est parti ! Devine la **marque** de la voiture.\nTape `!indice` pour obtenir des indices.\nTu as 10 essais maximum !',
            footer: 'La partie se termine automatiquement après 5 minutes d\'inactivité'
        });

        await thread.send({ embeds: [gameStartEmbed] });
        await interaction.followUp(`Partie créée ! Rendez-vous dans ${thread}`);

    } else if (commandName === 'abandon') {
        const userThread = Array.from(activeGames.entries()).find(([_, game]) => game.userId === user.id);
        if (!userThread) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Aucune partie en cours')
                .setDescription('Vous n\'avez aucune partie en cours.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const [threadId, game] = userThread;
        const thread = await client.channels.fetch(threadId);

        clearTimeout(game.timeoutId);
        
        const abandonEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🏳️ Partie abandonnée')
            .setDescription(`La voiture était : ${game.make} ${game.model}`);
        
        await thread.send({ embeds: [abandonEmbed] });
        await thread.setArchived(true);
        activeGames.delete(threadId);
        
        await interaction.reply({ content: 'Partie abandonnée !', ephemeral: true });

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

    } else if (commandName === 'aide') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle('📖 Aide - Guess The Car')
            .setDescription('Bienvenue dans Guess The Car ! Voici les règles du jeu :')
            .addFields(
                { 
                    name: '🎮 Déroulement', 
                    value: '1. Devinez d\'abord la marque de la voiture\n2. Puis devinez le modèle\n3. Vous avez 10 essais pour chaque étape' 
                },
                {   name: '📝 Points', 
                    value: '• 1 point pour une réussite complète\n• 0.5 point si vous trouvez avec aide ou uniquement la marque' 
                },
                { 
                    name: '⌨️ Commandes', 
                    value: '`/guesscar` - Démarrer une nouvelle partie\n`/abandon` - Abandonner la partie en cours\n`/classement` - Voir le classement\n`/stats` - Voir vos statistiques\n`!indice` - Obtenir un indice pendant la partie' 
                },
                {
                    name: '⏰ Timeout',
                    value: 'Une partie est automatiquement abandonnée après 5 minutes d\'inactivité'
                }
            );
        
        await interaction.reply({ embeds: [helpEmbed] });
    } else if (commandName === 'daily') {
        // Vérifier si le challenge existe et est à jour
        if (!dailyChallenge.car || dailyChallenge.date !== new Date().toDateString()) {
            await resetDailyChallenge();
        }

        if (dailyChallenge.players.has(user.id)) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Déjà participé')
                .setDescription('Vous avez déjà participé au challenge du jour. Revenez demain !');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const thread = await interaction.channel.threads.create({
            name: `🎯 Challenge quotidien - ${user.username}`,
            type: ChannelType.PrivateThread,
            autoArchiveDuration: 60
        });

        const game = {
            ...dailyChallenge.car,
            step: 'make',
            attempts: 0,
            startTime: Date.now(),
            userId: user.id,
            playerName: user.username,
            makeFailed: false,
            timeoutId: setTimeout(() => handleGameTimeout(thread.id, game), GAME_TIMEOUT),
            isDaily: true
        };

        activeGames.set(thread.id, game);

        const gameStartEmbed = createGameEmbed(game, {
            title: '🎯 Challenge Quotidien',
            description: 'C\'est parti ! Devine la **marque** de la voiture.\nTape `!indice` pour obtenir des indices.\nTu as 10 essais maximum !',
            footer: 'Les 3 premiers gagnants recevront des points bonus !'
        });

        await thread.send({ embeds: [gameStartEmbed] });
        await interaction.reply({ content: `Challenge quotidien lancé ! Rendez-vous dans ${thread}`, ephemeral: true });

    } else if (commandName === 'duel') {
        const opponent = interaction.options.getUser('adversaire');
        
        if (opponent.bot) {
            await interaction.reply({ content: "Vous ne pouvez pas défier un bot !", ephemeral: true });
            return;
        }

        if (opponent.id === user.id) {
            await interaction.reply({ content: "Vous ne pouvez pas vous défier vous-même !", ephemeral: true });
            return;
        }

        const existingDuel = Array.from(duels.values()).find(
            duel => duel.players.some(p => p.id === user.id || p.id === opponent.id)
        );

        if (existingDuel) {
            await interaction.reply({ content: "L'un des joueurs est déjà en duel !", ephemeral: true });
            return;
        }

        const thread = await interaction.channel.threads.create({
            name: `⚔️ Duel ${user.username} vs ${opponent.username}`,
            type: ChannelType.PrivateThread,
            autoArchiveDuration: 60
        });

        const car = await getRandomCar();
        if (!car) {
            await interaction.reply({ content: "Erreur lors de la création du duel. Réessayez !", ephemeral: true });
            return;
        }

        duels.set(thread.id, {
            car,
            players: [
                { id: user.id, name: user.username, step: 'make', attempts: 0, startTime: null },
                { id: opponent.id, name: opponent.username, step: 'make', attempts: 0, startTime: null }
            ],
            startTime: Date.now(),
            timeoutId: setTimeout(() => handleDuelTimeout(thread.id), GAME_TIMEOUT)
        });

        const duelStartEmbed = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle('⚔️ Duel commencé !')
            .setDescription(`${user.username} défie ${opponent.username} !\nDevinez la marque puis le modèle de la voiture.\nQue le meilleur gagne !`)
            .setFooter({ text: 'Le duel expire après 5 minutes d\'inactivité' });

        await thread.send({ content: `${opponent}`, embeds: [duelStartEmbed] });
        await interaction.reply({ content: `Duel créé ! Rendez-vous dans ${thread}`, ephemeral: true });

    } else if (commandName === 'timetrial') {
        if (timeTrials.has(user.id)) {
            await interaction.reply({ content: "Vous avez déjà une partie contre-la-montre en cours !", ephemeral: true });
            return;
        }

        const thread = await interaction.channel.threads.create({
            name: `⏱️ Contre-la-montre - ${user.username}`,
            type: ChannelType.PrivateThread,
            autoArchiveDuration: 60
        });

        timeTrials.set(user.id, {
            startTime: Date.now(),
            cars: [],
            active: true,
            threadId: thread.id
        });

        const car = await getRandomCar();
        if (!car) {
            await interaction.reply({ content: "Erreur lors de la création de la partie. Réessayez !", ephemeral: true });
            return;
        }

        const game = {
            ...car,
            step: 'make',
            attempts: 0,
            startTime: Date.now(),
            userId: user.id,
            playerName: user.username,
            makeFailed: false,
            isTimetrial: true
        };

        activeGames.set(thread.id, game);

        // Programmer la fin après 5 minutes
        setTimeout(() => handleTimeTrialEnd(user.id, thread.id), 5 * 60 * 1000);

        const timeTrialStartEmbed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('⏱️ Contre-la-montre')
            .setDescription('Devinez le maximum de voitures en 5 minutes !\nCommencez par deviner la **marque** de la première voiture.')
            .setFooter({ text: 'Temps restant: 5:00' });

        await thread.send({ embeds: [timeTrialStartEmbed] });
        await interaction.reply({ content: `Partie contre-la-montre lancée ! Rendez-vous dans ${thread}`, ephemeral: true });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const game = activeGames.get(message.channelId);
    if (!game || game.userId !== message.author.id) return;

    // Réinitialiser le timeout à chaque message
    clearTimeout(game.timeoutId);
    game.timeoutId = setTimeout(() => handleGameTimeout(message.channelId, game), GAME_TIMEOUT);

    const userAnswer = message.content.toLowerCase().trim();

    if (userAnswer === '!indice') {
        let hintDescription = '';
        if (game.step === 'make') {
            hintDescription = `🌍 Pays d'origine: ${game.country}\n📏 La marque contient ${game.makeLength} lettres`;
        } else {
            hintDescription = `📏 Le modèle contient ${game.modelLength} lettres / chiffres`;
        }

        const hintEmbed = createGameEmbed(game, {
            color: '#FFA500',
            title: '💡 Indice',
            description: hintDescription
        });
        
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
            const successEmbed = createGameEmbed(game, {
                title: '✅ Marque trouvée !',
                description: `C'est bien ${game.make} !\nMaintenant, devine le **modèle** de cette voiture.`
            });
            await message.reply({ embeds: [successEmbed] });
        } else {
            if (game.attempts >= 10) {
                game.makeFailed = true;
                game.step = 'model';
                game.attempts = 0;
                const failedEmbed = createGameEmbed(game, {
                    color: '#FFA500',
                    title: '⌛ Plus d\'essais',
                    description: `La marque était: **${game.make}**\nOn passe au modèle !`
                });
                await message.reply({ embeds: [failedEmbed] });
            } else {
                const wrongEmbed = createGameEmbed(game, {
                    color: '#FF0000',
                    title: '❌ Mauvaise réponse',
                    description: `Ce n'est pas la bonne marque, essaie encore ! (${10 - game.attempts} essais restants)${hintMessage}`
                });
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

            clearTimeout(game.timeoutId);
            await message.reply({ embeds: [winEmbed] });
            await message.channel.setArchived(true);
            activeGames.delete(message.channelId);
        } else {
            if (game.attempts >= 10) {
                const timeSpent = Date.now() - game.startTime;
                updateScore(message.author.id, message.author.username, false);
                updateGameStats(message.author.id, game.attempts, timeSpent);
                
                const gameOverEmbed = createGameEmbed(game, {
                    color: '#FFA500',
                    title: '⌛ Plus d\'essais',
                    description: `Le modèle était: **${game.model}**\nVous gagnez un demi-point pour avoir trouvé la marque.`
                });

                clearTimeout(game.timeoutId);
                await message.reply({ embeds: [gameOverEmbed] });
                await message.channel.setArchived(true);
                activeGames.delete(message.channelId);
            } else {
                const wrongModelEmbed = createGameEmbed(game, {
                    color: '#FF0000',
                    title: '❌ Mauvaise réponse',
                    description: `Ce n'est pas le bon modèle, essaie encore ! (${10 - game.attempts} essais restants)${hintMessage}`
                });

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