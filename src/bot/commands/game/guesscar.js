// src/bot/commands/game/guesscar.js - Version mise à jour avec boutons et mention

const { SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js');
const { gameEngine } = require('../../events/messageCreate');
const EmbedBuilder = require('../../../shared/utils/embedBuilder');
const logger = require('../../../shared/utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guesscar')
        .setDescription('Démarre une nouvelle partie de devine la voiture'),

    async execute(interaction) {
        try {
            // Vérifier s'il y a déjà une partie active pour ce joueur
            const existingGame = gameEngine.findActiveGameByUser(interaction.user.id);

            if (existingGame) {
                const errorEmbed = EmbedBuilder.createErrorEmbed(
                    'Partie déjà en cours',
                    `Vous avez déjà une partie en cours dans <#${existingGame.threadId}> !`
                );
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                return;
            }

            // Différer la réponse pour éviter le timeout
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Créer le thread pour la partie
            const thread = await interaction.channel.threads.create({
                name: `🚗 Partie de ${interaction.user.username}`,
                type: ChannelType.PrivateThread,
                autoArchiveDuration: 60
            });

            // Démarrer la partie
            const gameState = await gameEngine.startGame(
                interaction.user.id,
                interaction.user.username,
                thread.id,
                interaction.guild?.id
            );

            // ✅ MODIFIÉ: Créer l'embed de démarrage avec boutons
            const gameStartResponse = EmbedBuilder.createGameStartEmbed(gameState.car, gameState);

            // Envoyer dans le thread avec les boutons ET la mention
            await thread.send({
                content: `<@${interaction.user.id}>`, // <-- La mention qui ajoute l'utilisateur au fil
                ...gameStartResponse // Réutilise les embeds et boutons de la réponse
            });

            // Répondre à l'utilisateur
            const successEmbed = EmbedBuilder.createSuccessEmbed(
                'Partie créée !',
                `Votre partie a été créée dans ${thread}.\nUtilisez les boutons pour interagir avec le jeu !`
            );

            await interaction.editReply({ embeds: [successEmbed] });

            logger.info('Game started:', {
                car: gameState.car.getFullName(),
                difficulty: gameState.car.getDifficultyText(),
                threadId: thread.id,
                userId: interaction.user.id,
                username: interaction.user.username
            });


        } catch (error) {
            logger.error('Error in guesscar command:', {
                userId: interaction.user.id,
                error: error.message
            });

            const errorEmbed = EmbedBuilder.createErrorEmbed(
                'Erreur',
                'Impossible de créer une partie pour le moment. Veuillez réessayer.'
            );

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};
