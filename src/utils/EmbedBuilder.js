const { EmbedBuilder } = require('discord.js');

class GameEmbedBuilder {
    static createGameEmbed(game, message) {
        const embed = new EmbedBuilder()
            .setColor(message.color || '#00FF00')
            .setTitle(message.title)
            .setDescription(message.description);

        if (game && game.playerName) {
            embed.setFooter({ 
                text: `Partie de ${game.playerName} | Essais: ${game.attempts}/10${message.footer ? ' | ' + message.footer : ''}`
            });
        }

        return embed;
    }

    static createWinEmbed(game, timeSpent, fullSuccess, totalScore) {
        return new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 Félicitations !')
            .setDescription(`Tu as deviné la voiture : ${game.make} ${game.model}`)
            .addFields(
                { name: '⏱️ Temps', value: `${(timeSpent / 1000).toFixed(1)} secondes`, inline: true },
                { name: '🎯 Nombre d\'essais', value: `${game.attempts}`, inline: true },
                { name: fullSuccess ? '🌟 Réussite' : '⭐ Réussite partielle', 
                  value: fullSuccess ? 'Point complet obtenu !' : 'Demi-point obtenu (marque trouvée avec aide)', 
                  inline: true },
                { name: '🏆 Score total', value: `${totalScore.toFixed(1)} points` }
            );
    }
}

module.exports = GameEmbedBuilder;