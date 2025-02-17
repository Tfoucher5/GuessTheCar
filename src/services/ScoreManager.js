const fs = require('fs').promises;
const path = require('path');
const UserStats = require('./UserStats');

class ScoreManager {
    constructor() {
        this.stats = new Map();
        this.filePath = path.join(process.cwd(), 'scores.json');
        this.loadScores(); // On charge les scores au démarrage
    }

    async loadScores() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            const scores = JSON.parse(data);
            
            // Conversion des données JSON en instances de UserStats
            for (const userId in scores) {
                const userData = scores[userId];
                const userStats = new UserStats(userData.username);
                Object.assign(userStats, userData);
                this.stats.set(userId, userStats);
            }
            console.log(`Scores chargés: ${this.stats.size} joueurs`);
        } catch (error) {
            console.error('Erreur lors du chargement des scores:', error);
            // Création du fichier s'il n'existe pas
            await this.saveScores();
        }
    }

    async saveScores() {
        try {
            const scores = {};
            for (const [userId, stats] of this.stats) {
                scores[userId] = {
                    username: stats.username,
                    carsGuessed: stats.carsGuessed,
                    partialGuesses: stats.partialGuesses,
                    totalAttempts: stats.totalAttempts,
                    bestTime: stats.bestTime,
                    lastGameTime: stats.lastGameTime
                };
            }
            await fs.writeFile(this.filePath, JSON.stringify(scores, null, 2));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des scores:', error);
        }
    }

    getUserStats(userId) {
        return this.stats.get(userId);
    }

    async updateScore(userId, username, isFullSuccess) {
        let userStats = this.stats.get(userId);
        if (!userStats) {
            userStats = new UserStats(username);
            this.stats.set(userId, userStats);
        }
        
        if (isFullSuccess) {
            userStats.carsGuessed++;
        } else {
            userStats.partialGuesses++;
        }

        await this.saveScores();
    }

    async updateGameStats(userId, attempts, time) {
        const userStats = this.stats.get(userId);
        if (userStats) {
            userStats.totalAttempts += attempts;
            userStats.lastGameTime = Date.now();
            
            if (!userStats.bestTime || time < userStats.bestTime) {
                userStats.bestTime = time;
            }
            
            await this.saveScores();
        }
    }

    getLeaderboard() {
        const players = Array.from(this.stats.values())
            .filter(stats => stats.carsGuessed > 0 || stats.partialGuesses > 0)
            .map(stats => ({
                username: stats.username,
                totalScore: stats.calculateTotalScore(),
                carsGuessed: stats.carsGuessed,
                partialGuesses: stats.partialGuesses,
                averageAttempts: stats.averageAttempts,
                bestTime: stats.bestTime
            }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);

        return players;
    }
}

module.exports = ScoreManager;