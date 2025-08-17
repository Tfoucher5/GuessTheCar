/* eslint-disable no-undef */
const axios = require('axios');

class StatsReporter {
    constructor(apiUrl = 'http://localhost:3000/api') {
        this.apiUrl = apiUrl;
        this.stats = {
            commands: { total: 0, today: 0 },
            games: { active: 0, today: 0, total: 0 },
            performance: {},
            uptime: 0
        };
    }

    // Envoyer les stats à l'API
    async sendStats() {
        try {
            await axios.post(`${this.apiUrl}/bot/stats`, {
                commands: this.stats.commands,
                games: this.stats.games,
                performance: this.getPerformanceStats(),
                uptime: process.uptime(),
                customStats: {
                    lastRestart: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development'
                }
            });
            console.log('✅ Stats envoyées à l\'API');
        } catch (error) {
            console.error('❌ Erreur envoi stats:', error.message);
        }
    }

    // Logger une commande
    async logCommand(command, interaction) {
        this.stats.commands.total++;
        this.stats.commands.today++;

        try {
            await axios.post(`${this.apiUrl}/bot/command`, {
                command: command,
                user: interaction.user.id,
                guild: interaction.guild?.id,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erreur log commande:', error.message);
        }
    }

    // Logger le début d'une session de jeu
    async logGameStart(user, guild, gameData = {}) {
        this.stats.games.active++;
        this.stats.games.today++;
        this.stats.games.total++;

        try {
            await axios.post(`${this.apiUrl}/bot/game`, {
                action: 'start',
                user: user.id,
                guild: guild?.id,
                gameData: gameData,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erreur log game start:', error.message);
        }
    }

    // Logger la fin d'une session de jeu
    async logGameEnd(user, guild, gameData = {}) {
        this.stats.games.active = Math.max(0, this.stats.games.active - 1);

        try {
            await axios.post(`${this.apiUrl}/bot/game`, {
                action: 'end',
                user: user.id,
                guild: guild?.id,
                gameData: gameData,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Erreur log game end:', error.message);
        }
    }

    // Récupérer les stats de performance
    getPerformanceStats() {
        const memUsage = process.memoryUsage();
        return {
            memoryUsage: {
                rss: Math.round(memUsage.rss / 1024 / 1024), // MB
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            },
            uptime: process.uptime(),
            platform: process.platform,
            nodeVersion: process.version
        };
    }

    // Démarrer l'envoi automatique des stats (toutes les 2 minutes)
    startAutoReporting() {
        setInterval(() => {
            this.sendStats();
        }, 2 * 60 * 1000); // 2 minutes

        // Envoyer les stats au démarrage
        this.sendStats();
    }
}

module.exports = StatsReporter;