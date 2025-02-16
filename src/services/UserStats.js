class UserStats {
    constructor(username) {
        this.username = username;
        this.carsGuessed = 0;          // Réussites complètes
        this.partialGuesses = 0;       // Réussites partielles
        this.totalAttempts = 0;        // Nombre total d'essais
        this.bestTime = null;          // Meilleur temps en millisecondes
        this.lastGameTime = null;      // Temps de la dernière partie
    }

    calculateTotalScore() {
        return this.carsGuessed + (this.partialGuesses * 0.5);
    }

    get averageAttempts() {
        const totalGames = this.carsGuessed + this.partialGuesses;
        return totalGames > 0 ? this.totalAttempts / totalGames : 0;
    }

    updateStats(attempts, time, isFullSuccess) {
        this.totalAttempts += attempts;
        this.lastGameTime = time;
        
        if (isFullSuccess) {
            this.carsGuessed++;
        } else {
            this.partialGuesses++;
        }

        // Met à jour le meilleur temps si c'est la première partie ou si c'est un nouveau record
        if (!this.bestTime || time < this.bestTime) {
            this.bestTime = time;
        }
    }
}

module.exports = UserStats;