class UserStats {
    constructor(username) {
        this.username = username;
        this.carsGuessed = 0;
        this.partialGuesses = 0;
        this.totalPoints = 0;          // Points de base
        this.totalDifficultyPoints = 0; // Points avec multiplicateur de difficulté
        this.totalAttempts = 0;
        this.bestTime = null;
        this.lastGameTime = null;
    }

    addPoints(points, isFullSuccess, difficultyPoints) {
        this.totalPoints += points;
        this.totalDifficultyPoints += difficultyPoints;
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

module.exports = UserStats;