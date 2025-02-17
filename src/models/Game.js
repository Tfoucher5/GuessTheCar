class Game {
    constructor(car, userId, username, threadId) {
        this.make = car.make;
        this.model = car.model;
        this.country = car.country;
        this.modelDate = car.modelDate;
        this.makeLength = car.makeLength;
        this.modelLength = car.modelLength;
        this.firstLetter = car.firstLetter;
        this.modelFirstLetter = car.modelFirstLetter;
        this.modelDifficulte = car.modelDifficulte;
        this.userId = userId;
        this.username = username;
        this.threadId = threadId;
        this.attempts = 0;
        this.step = 'make';
        this.makeFailed = false;
        this.startTime = Date.now();
    }

    updateCar(car) {
        this.make = car.make;
        this.model = car.model;
        this.country = car.country;
        this.modelDate = car.modelDate;
        this.makeLength = car.makeLength;
        this.modelLength = car.modelLength;
        this.firstLetter = car.firstLetter;
        this.modelFirstLetter = car.modelFirstLetter;
        this.modelDifficulte = car.modelDifficulte;
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