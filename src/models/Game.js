class Game {
    constructor(car, userId, playerName, threadId) {
        this.make = car.make;
        this.model = car.model;
        this.makeId = car.makeId;
        this.country = car.country;
        this.isCommon = car.isCommon;
        this.modelLength = car.modelLength;
        this.makeLength = car.makeLength;
        this.firstLetter = car.firstLetter;
        this.modelFirstLetter = car.modelFirstLetter;
        this.step = 'make';
        this.attempts = 0;
        this.startTime = Date.now();
        this.userId = userId;
        this.playerName = playerName;
        this.makeFailed = false;
        this.threadId = threadId;
        this.timeoutId = null;
    }

    resetAttempts() {
        this.attempts = 0;
    }

    incrementAttempts() {
        this.attempts++;
        return this.attempts;
    }

    getTimeSpent() {
        return Date.now() - this.startTime;
    }
}

module.exports = Game;