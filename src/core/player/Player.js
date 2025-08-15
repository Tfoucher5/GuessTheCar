const { validateUserId, validateUsername } = require('../../shared/utils/validation');

class Player {
    constructor(userId, username) {
        this.userId = validateUserId(userId);
        this.username = validateUsername(username);

        // Statistiques de jeu
        this.carsGuessed = 0;
        this.partialGuesses = 0;
        this.totalPoints = 0;
        this.totalDifficultyPoints = 0;
        this.totalAttempts = 0;
        this.bestTime = null;
        this.lastGameTime = null;

        // Métadonnées
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Ajoute des points au joueur
     */
    addPoints(basePoints, difficultyPoints, isFullSuccess) {
        this.totalPoints += basePoints;
        this.totalDifficultyPoints += difficultyPoints;

        if (isFullSuccess) {
            this.carsGuessed++;
        } else {
            this.partialGuesses++;
        }

        this.updatedAt = new Date();
    }

    /**
     * Met à jour les statistiques de jeu
     */
    updateGameStats(attempts, gameTime) {
        this.totalAttempts += attempts;
        this.lastGameTime = gameTime;

        if (!this.bestTime || gameTime < this.bestTime) {
            this.bestTime = gameTime;
        }

        this.updatedAt = new Date();
    }

    /**
     * Calcule la moyenne d'essais par partie
     */
    get averageAttempts() {
        const totalGames = this.carsGuessed + this.partialGuesses;
        return totalGames > 0 ? this.totalAttempts / totalGames : 0;
    }

    /**
     * Calcule le nombre total de parties
     */
    get totalGames() {
        return this.carsGuessed + this.partialGuesses;
    }

    /**
     * Calcule le taux de réussite
     */
    get successRate() {
        const totalGames = this.totalGames;
        return totalGames > 0 ? (this.carsGuessed / totalGames) * 100 : 0;
    }

    /**
     * Obtient le meilleur temps formaté
     */
    get bestTimeFormatted() {
        return this.bestTime ? `${(this.bestTime / 1000).toFixed(1)}s` : 'N/A';
    }

    /**
     * Obtient le rang approximatif du joueur
     */
    getRank(totalPoints) {
        if (totalPoints >= 50) return '🏆 Maître';
        if (totalPoints >= 25) return '🥇 Expert';
        if (totalPoints >= 15) return '🥈 Avancé';
        if (totalPoints >= 8) return '🥉 Intermédiaire';
        if (totalPoints >= 3) return '📚 Apprenti';
        return '🌱 Débutant';
    }

    /**
     * Vérifie si le joueur a des statistiques
     */
    hasStats() {
        return this.totalGames > 0;
    }

    /**
     * Convertit en objet pour la base de données
     */
    toDatabase() {
        return {
            user_id: this.userId,
            username: this.username,
            cars_guessed: this.carsGuessed,
            partial_guesses: this.partialGuesses,
            total_points: this.totalPoints,
            total_difficulty_points: this.totalDifficultyPoints,
            total_attempts: this.totalAttempts,
            best_time: this.bestTime,
            last_game_time: this.lastGameTime,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }

    /**
     * Convertit en objet simple
     */
    toJSON() {
        return {
            userId: this.userId,
            username: this.username,
            carsGuessed: this.carsGuessed,
            partialGuesses: this.partialGuesses,
            totalPoints: this.totalPoints,
            totalDifficultyPoints: this.totalDifficultyPoints,
            totalAttempts: this.totalAttempts,
            averageAttempts: this.averageAttempts,
            bestTime: this.bestTime,
            bestTimeFormatted: this.bestTimeFormatted,
            lastGameTime: this.lastGameTime,
            totalGames: this.totalGames,
            successRate: this.successRate,
            rank: this.getRank(this.totalDifficultyPoints),
            hasStats: this.hasStats(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Crée une instance depuis les données de base
     */
    static fromDatabase(dbData) {
        const player = new Player(dbData.user_id, dbData.username);

        player.carsGuessed = dbData.cars_guessed || 0;
        player.partialGuesses = dbData.partial_guesses || 0;
        player.totalPoints = dbData.total_points || 0;
        player.totalDifficultyPoints = dbData.total_difficulty_points || 0;
        player.totalAttempts = dbData.total_attempts || 0;
        player.bestTime = dbData.best_time;
        player.lastGameTime = dbData.last_game_time;
        player.createdAt = dbData.created_at || new Date();
        player.updatedAt = dbData.updated_at || new Date();

        return player;
    }

    /**
     * Crée une instance depuis les anciennes données de scores.json
     */
    static fromLegacyData(userId, data) {
        const player = new Player(userId, data.username);

        player.carsGuessed = data.carsGuessed || 0;
        player.partialGuesses = data.partialGuesses || 0;
        player.totalPoints = data.totalPoints || 0;
        player.totalDifficultyPoints = data.totalDifficultyPoints || 0;
        player.totalAttempts = data.totalAttempts || 0;
        player.bestTime = data.bestTime;
        player.lastGameTime = data.lastGameTime;

        return player;
    }
}

module.exports = Player;
