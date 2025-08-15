// src/core/player/Player.js - VERSION COMPLÈTE CORRIGÉE

class Player {
    constructor(userId, username) {
        this.id = null;
        this.userId = userId;
        this.username = username;

        // Correspondance avec les colonnes de user_scores
        this.totalPoints = 0;
        this.totalDifficultyPoints = 0;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.correctBrandGuesses = 0;
        this.correctModelGuesses = 0;
        this.totalBrandGuesses = 0;
        this.totalModelGuesses = 0;
        this.bestStreak = 0;
        this.currentStreak = 0;
        this.averageResponseTime = 0;

        this.createdAt = null;
        this.updatedAt = null;
    }

    /**
     * Crée une instance Player depuis les données de base
     */
    static fromDatabase(data) {
        const player = new Player(data.user_id, data.username);

        player.id = data.id;

        // Assurer que toutes les valeurs numériques sont définies
        player.totalPoints = Number(data.total_points) || 0;
        player.totalDifficultyPoints = Number(data.total_difficulty_points) || 0;
        player.gamesPlayed = Number(data.games_played) || 0;
        player.gamesWon = Number(data.games_won) || 0;
        player.correctBrandGuesses = Number(data.correct_brand_guesses) || 0;
        player.correctModelGuesses = Number(data.correct_model_guesses) || 0;
        player.totalBrandGuesses = Number(data.total_brand_guesses) || 0;
        player.totalModelGuesses = Number(data.total_model_guesses) || 0;
        player.bestStreak = Number(data.best_streak) || 0;
        player.currentStreak = Number(data.current_streak) || 0;
        player.averageResponseTime = Number(data.average_response_time) || 0;
        player.createdAt = data.created_at;
        player.updatedAt = data.updated_at;

        return player;
    }

    /**
     * Propriétés calculées pour compatibilité avec embedBuilder
     */
    get carsGuessed() {
        return this.gamesWon;
    }

    get partialGuesses() {
        return this.gamesPlayed - this.gamesWon;
    }

    get totalGames() {
        return this.gamesPlayed;
    }

    get averageAttempts() {
        if (this.gamesPlayed === 0) return 0;
        // Estimation basée sur les tentatives de marques
        return this.totalBrandGuesses > 0 ? this.totalBrandGuesses / this.gamesPlayed : 0;
    }

    get bestTimeFormatted() {
        if (!this.averageResponseTime || this.averageResponseTime === 0) {
            return 'N/A';
        }
        return `${Number(this.averageResponseTime).toFixed(1)}s`;
    }

    /**
     * Convertit en format base de données
     */
    toDatabase() {
        return {
            user_id: this.userId,
            username: this.username,
            total_points: this.totalPoints,
            total_difficulty_points: this.totalDifficultyPoints,
            games_played: this.gamesPlayed,
            games_won: this.gamesWon,
            correct_brand_guesses: this.correctBrandGuesses,
            correct_model_guesses: this.correctModelGuesses,
            total_brand_guesses: this.totalBrandGuesses,
            total_model_guesses: this.totalModelGuesses,
            best_streak: this.bestStreak,
            current_streak: this.currentStreak,
            average_response_time: this.averageResponseTime
        };
    }

    /**
     * Ajoute des points au joueur
     */
    addPoints(basePoints, difficultyPoints, isFullSuccess) {
        this.totalPoints += basePoints;
        this.totalDifficultyPoints += difficultyPoints;
        this.gamesPlayed += 1;

        if (isFullSuccess) {
            this.gamesWon += 1;
            this.currentStreak += 1;
            this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
        } else {
            this.currentStreak = 0;
        }
    }

    /**
     * Ajoute une tentative de marque
     */
    addBrandGuess(isCorrect) {
        this.totalBrandGuesses += 1;
        if (isCorrect) {
            this.correctBrandGuesses += 1;
        }
    }

    /**
     * Ajoute une tentative de modèle
     */
    addModelGuess(isCorrect) {
        this.totalModelGuesses += 1;
        if (isCorrect) {
            this.correctModelGuesses += 1;
        }
    }

    /**
     * Met à jour le temps de réponse moyen
     */
    updateResponseTime(newTime) {
        if (this.gamesPlayed === 0) {
            this.averageResponseTime = newTime;
        } else {
            this.averageResponseTime = (
                (this.averageResponseTime * (this.gamesPlayed - 1) + newTime) / this.gamesPlayed
            );
        }
    }

    /**
     * Calcule le taux de réussite global avec protection
     */
    getSuccessRate() {
        if (this.gamesPlayed === 0) return 0;
        return (this.gamesWon / this.gamesPlayed) * 100;
    }

    /**
     * Calcule le taux de réussite pour les marques avec protection
     */
    getBrandSuccessRate() {
        if (this.totalBrandGuesses === 0) return 0;
        return (this.correctBrandGuesses / this.totalBrandGuesses) * 100;
    }

    /**
     * Calcule le taux de réussite pour les modèles avec protection
     */
    getModelSuccessRate() {
        if (this.totalModelGuesses === 0) return 0;
        return (this.correctModelGuesses / this.totalModelGuesses) * 100;
    }

    /**
     * Obtient le niveau de compétence
     */
    getSkillLevel() {
        if (this.totalDifficultyPoints >= 100) return 'Légende';
        if (this.totalDifficultyPoints >= 50) return 'Maître';
        if (this.totalDifficultyPoints >= 25) return 'Expert';
        if (this.totalDifficultyPoints >= 15) return 'Avancé';
        if (this.totalDifficultyPoints >= 8) return 'Intermédiaire';
        if (this.totalDifficultyPoints >= 3) return 'Apprenti';
        return 'Débutant';
    }

    /**
     * Convertit en JSON avec toutes les protections
     */
    toJSON() {
        return {
            userId: this.userId,
            username: this.username,
            totalPoints: this.totalPoints,
            totalDifficultyPoints: this.totalDifficultyPoints,
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            correctBrandGuesses: this.correctBrandGuesses,
            correctModelGuesses: this.correctModelGuesses,
            totalBrandGuesses: this.totalBrandGuesses,
            totalModelGuesses: this.totalModelGuesses,
            bestStreak: this.bestStreak,
            currentStreak: this.currentStreak,
            // Protection toFixed() avec Number()
            averageResponseTime: Number(this.averageResponseTime || 0).toFixed(2),
            successRate: Number(this.getSuccessRate()).toFixed(2),
            brandSuccessRate: Number(this.getBrandSuccessRate()).toFixed(2),
            modelSuccessRate: Number(this.getModelSuccessRate()).toFixed(2),
            skillLevel: this.getSkillLevel(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            // Propriétés supplémentaires pour embedBuilder
            carsGuessed: this.carsGuessed,
            partialGuesses: this.partialGuesses,
            totalGames: this.totalGames,
            averageAttempts: Number(this.averageAttempts).toFixed(1),
            bestTimeFormatted: this.bestTimeFormatted
        };
    }
}

module.exports = Player;