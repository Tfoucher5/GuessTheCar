class UserStats {
    constructor(username) {
        this.username = username;
        this.carsGuessed = 0;          // Nombre de réussites complètes
        this.partialGuesses = 0;       // Nombre de réussites partielles
        this.totalPoints = 0;          // Total des points gagnés
        this.totalAttempts = 0;        // Nombre total d'essais
        this.bestTime = null;          // Meilleur temps en millisecondes
        this.lastGameTime = null;      // Temps de la dernière partie
    }

    addPoints(points, isFullSuccess) {
        this.totalPoints += points;
        if (isFullSuccess) {
            this.carsGuessed++;
        } else {
            this.partialGuesses++;
        }
    }

    get averageAttempts() {
        const totalGames = this.carsGuessed + this.partialGuesses;
        return totalGames > 0 ? this.totalAttempts / totalGames : 0;
    }

    updateStats(attempts, time) {
        this.totalAttempts += attempts;
        this.lastGameTime = time;
        
        // Met à jour le meilleur temps si c'est la première partie ou si c'est un nouveau record
        if (!this.bestTime || time < this.bestTime) {
            this.bestTime = time;
        }
    }
}

module.exports = { UserStats, ScoreManager };