class UserScore {
    constructor(username) {
        this.username = username;
        this.carsGuessed = 0;
        this.totalAttempts = 0;
        this.bestTime = null;
        this.partialGuesses = 0;
    }

    addGuess(fullSuccess) {
        if (fullSuccess) {
            this.carsGuessed++;
        } else {
            this.partialGuesses++;
        }
    }

    updateStats(attempts, time) {
        this.totalAttempts += attempts;
        if (!this.bestTime || time < this.bestTime) {
            this.bestTime = time;
        }
    }

    calculateTotalScore() {
        return this.carsGuessed + (this.partialGuesses * 0.5);
    }
}

module.exports = UserScore;