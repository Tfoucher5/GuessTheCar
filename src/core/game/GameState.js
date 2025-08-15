const gameConfig = require('../../shared/config/game');
const { validateUserId, validateUsername } = require('../../shared/utils/validation');

class GameState {
    constructor(car, userId, username, threadId) {
        // Validation des entrées
        this.userId = validateUserId(userId);
        this.username = validateUsername(username);
        this.threadId = threadId;

        // Données de la voiture
        this.car = car;

        // État du jeu
        this.step = 'make'; // 'make' ou 'model'
        this.attempts = 0;
        this.makeFailed = false;
        this.carChangesCount = 0;

        // Gestion du temps
        this.startTime = Date.now();
        this.timeoutId = null;

        // État des indices
        this.hintsUsed = {
            firstLetter: false,
            lastLetter: false,
            country: false,
            length: false,
            year: false
        };
    }

    /**
     * Met à jour la voiture (lors d'un changement)
     */
    updateCar(newCar) {
        this.car = newCar;
        this.step = 'make';
        this.attempts = 0;
        this.makeFailed = false;
        this.hintsUsed = {
            firstLetter: false,
            lastLetter: false,
            country: false,
            length: false,
            year: false
        };
    }

    /**
     * Incrémente le nombre d'essais
     */
    incrementAttempts() {
        this.attempts++;
        return this.attempts;
    }

    /**
     * Réinitialise les essais (passage make -> model)
     */
    resetAttempts() {
        this.attempts = 0;
    }

    /**
     * Vérifie si le joueur peut changer de voiture
     */
    canChangeCar() {
        return this.carChangesCount < gameConfig.MAX_CAR_CHANGES;
    }

    /**
     * Incrémente le compteur de changements de voiture
     */
    incrementCarChanges() {
        if (!this.canChangeCar()) {
            throw new Error('Limite de changements de voiture atteinte');
        }
        this.carChangesCount++;
        return this.carChangesCount;
    }

    /**
     * Passe à l'étape suivante (make -> model)
     */
    nextStep() {
        if (this.step === 'make') {
            this.step = 'model';
            this.resetAttempts();
        }
    }

    /**
     * Marque l'échec de la recherche de marque
     */
    setMakeFailed() {
        this.makeFailed = true;
        this.nextStep();
    }

    /**
     * Calcule le temps écoulé depuis le début
     */
    getTimeSpent() {
        return Date.now() - this.startTime;
    }

    /**
     * Vérifie si le jeu a atteint la limite d'essais
     */
    hasReachedMaxAttempts() {
        return this.attempts >= gameConfig.MAX_ATTEMPTS;
    }

    /**
     * Vérifie si le jeu est dans l'étape de recherche de marque
     */
    isSearchingMake() {
        return this.step === 'make';
    }

    /**
     * Vérifie si le jeu est dans l'étape de recherche de modèle
     */
    isSearchingModel() {
        return this.step === 'model';
    }

    /**
     * Obtient le message d'indice approprié selon l'étape et les essais
     */
    getHintMessage() {
        if (this.isSearchingMake()) {
            return this.getMakeHintMessage();
        } else {
            return this.getModelHintMessage();
        }
    }

    /**
     * Obtient l'indice pour la recherche de marque
     */
    getMakeHintMessage() {
        let hints = [];

        if (!this.hintsUsed.country) {
            hints.push(`🌍 Pays d'origine: ${this.car.country}`);
            this.hintsUsed.country = true;
        }

        if (!this.hintsUsed.length) {
            hints.push(`📏 La marque contient ${this.car.makeLength} lettres`);
            this.hintsUsed.length = true;
        }

        if (this.attempts >= gameConfig.HINTS.FIRST_LETTER_ATTEMPT && !this.hintsUsed.firstLetter) {
            hints.push(`🔤 La marque commence par "${this.car.firstLetter}"`);
            this.hintsUsed.firstLetter = true;
        }

        return hints.join('\n');
    }

    /**
     * Obtient l'indice pour la recherche de modèle
     */
    getModelHintMessage() {
        let hints = [];

        if (!this.hintsUsed.length) {
            hints.push(`📏 Le modèle contient ${this.car.modelLength} lettres/chiffres`);
            this.hintsUsed.length = true;
        }

        if (!this.hintsUsed.year) {
            hints.push(`📆 Le modèle est de ${this.car.modelDate}`);
            this.hintsUsed.year = true;
        }

        if (this.attempts >= gameConfig.HINTS.FIRST_LETTER_ATTEMPT && !this.hintsUsed.firstLetter) {
            hints.push(`🔤 Le modèle commence par "${this.car.modelFirstLetter}"`);
            this.hintsUsed.firstLetter = true;
        }

        if (this.attempts >= gameConfig.HINTS.LAST_LETTER_ATTEMPT && !this.hintsUsed.lastLetter) {
            const lastLetter = this.car.model[this.car.model.length - 1];
            hints.push(`🔤 Le modèle se termine par "${lastLetter}"`);
            this.hintsUsed.lastLetter = true;
        }

        return hints.join('\n');
    }

    /**
     * Obtient la progression du jeu en pourcentage
     */
    getProgress() {
        if (this.isSearchingMake()) {
            return (this.attempts / gameConfig.MAX_ATTEMPTS) * 50; // 50% pour la marque
        } else {
            return 50 + (this.attempts / gameConfig.MAX_ATTEMPTS) * 50; // 50% + 50% pour le modèle
        }
    }

    /**
     * Obtient le statut actuel du jeu
     */
    getStatus() {
        return {
            step: this.step,
            attempts: this.attempts,
            maxAttempts: gameConfig.MAX_ATTEMPTS,
            carChangesUsed: this.carChangesCount,
            maxCarChanges: gameConfig.MAX_CAR_CHANGES,
            timeSpent: this.getTimeSpent(),
            progress: this.getProgress(),
            makeFailed: this.makeFailed,
            canChangeCar: this.canChangeCar(),
            hasReachedMaxAttempts: this.hasReachedMaxAttempts()
        };
    }

    /**
     * Vérifie si le jeu est terminé
     */
    isFinished() {
        return this.hasReachedMaxAttempts() && this.isSearchingModel();
    }

    /**
     * Calcule le score final
     */
    calculateFinalScore() {
        const isFullSuccess = !this.makeFailed;
        const basePoints = isFullSuccess ? gameConfig.POINTS.FULL_SUCCESS : gameConfig.POINTS.PARTIAL_SUCCESS;
        const multiplier = gameConfig.DIFFICULTY_MULTIPLIERS[this.car.difficulty] || 1;
        const difficultyPoints = basePoints * multiplier;

        return {
            basePoints,
            difficultyPoints,
            isFullSuccess,
            difficulty: this.car.difficulty,
            difficultyText: this.car.getDifficultyText()
        };
    }

    /**
     * Convertit en objet simple pour sérialisation
     */
    toJSON() {
        return {
            userId: this.userId,
            username: this.username,
            threadId: this.threadId,
            car: this.car.toJSON(),
            step: this.step,
            attempts: this.attempts,
            makeFailed: this.makeFailed,
            carChangesCount: this.carChangesCount,
            startTime: this.startTime,
            timeSpent: this.getTimeSpent(),
            hintsUsed: this.hintsUsed,
            status: this.getStatus(),
            isFinished: this.isFinished()
        };
    }
}

module.exports = GameState;
