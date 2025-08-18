const { SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js');
const { gameEngine } = require('../../events/messageCreate');
const EmbedBuilder = require('../../../shared/utils/embedBuilder');
const logger = require('../../../shared/utils/logger');
const statsHelper = require('../../../shared/utils/StatsHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guesscar')
        .setDescription('Démarre une nouvelle partie de devine la voiture'),

    async execute(interaction) {
        try {
            if (global.statsReporter) {
                await global.statsReporter.logCommand('guesscar', interaction);
            }
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
                thread.id
            );

            // Créer l'embed de démarrage
            const gameStartEmbed = EmbedBuilder.createGameStartEmbed(gameState.car, gameState);

            // Envoyer l'embed dans le thread
            await thread.send({ embeds: [gameStartEmbed] });

            // Répondre à l'utilisateur
            const successEmbed = EmbedBuilder.createSuccessEmbed(
                'Partie créée !',
                `Votre partie a été créée dans ${thread}. Bonne chance !`
            );

            await interaction.editReply({ embeds: [successEmbed] });

            logger.info('New game started via command:', {
                userId: interaction.user.id,
                username: interaction.user.username,
                threadId: thread.id,
                guildId: interaction.guild?.id
            });

            statsHelper.logCommand('guesscar', interaction.user.id);
            statsHelper.logGame('start', interaction.channel.id, interaction.user.id);

        } catch (error) {
            logger.error('Error in guesscar command:', {
                userId: interaction.user.id,
                error: error.message
            });

            const errorEmbed = EmbedBuilder.createErrorEmbed(
                'Erreur',
                'Une erreur est survenue lors de la création de la partie. Veuillez réessayer.'
            );

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};
