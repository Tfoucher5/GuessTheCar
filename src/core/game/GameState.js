const gameConfig = require('../../shared/config/game');
const { validateUserId, validateUsername } = require('../../shared/utils/validation');

class GameState {
    constructor(car, userId, username, threadId) {
        // Validation des entrées
        this.userId = validateUserId(userId);
        this.username = validateUsername(username);
        this.threadId = threadId;
        this.attemptsMake = 0;

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
            makeLength: false,
            modelLength: false,
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
        this.attemptsMake = 0;
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
     * Obtient le statut actuel du jeu (MÉTHODE MANQUANTE)
     */
    getStatus() {
        return {
            step: this.step,
            attempts: this.attempts,
            attemptsMake: this.attemptsMake,
            maxAttempts: gameConfig.MAX_ATTEMPTS,
            makeFailed: this.makeFailed,
            carChangesCount: this.carChangesCount,
            timeSpent: this.getTimeSpent(),
            car: {
                id: this.car.id,
                brand: this.car.brand,
                model: this.car.model,
                difficulty: this.car.difficulty
            }
        };
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

        // Indice du pays (toujours disponible en premier)
        if (!this.hintsUsed.country) {
            hints.push(`🌍 Pays d'origine: ${this.car.country || 'Inconnu'}`);
            this.hintsUsed.country = true;
        }

        // Indice de la longueur
        if (!this.hintsUsed.makeLength) {
            hints.push(`📏 La marque contient ${this.car.makeLength} lettres`);
            this.hintsUsed.makeLength = true;
        }

        // Indice de la première lettre (après plusieurs tentatives)
        if (this.attempts >= 3 && !this.hintsUsed.makeFirstLetter) {
            hints.push(`🔤 La marque commence par "${this.car.firstLetter}"`);
            this.hintsUsed.makeFirstLetter = true;
        }

        return hints.length > 0 ? hints.join('\n') : 'Aucun indice supplémentaire disponible.';
    }

    /**
  * Obtient l'indice pour la recherche de modèle
  */
    getModelHintMessage() {
        let hints = [];

        // Indice de la longueur du modèle
        if (!this.hintsUsed.modelLength) {
            hints.push(`📏 Le modèle contient ${this.car.modelLength} lettres/chiffres`);
            this.hintsUsed.modelLength = true;
        }

        // Indice de l'année
        if (!this.hintsUsed.year) {
            hints.push(`📆 Le modèle est de ${this.car.modelDate}`);
            this.hintsUsed.year = true;
        }

        // Indice de la première lettre du modèle
        if (this.attempts >= 3 && !this.hintsUsed.modelFirstLetter) {
            hints.push(`🔤 Le modèle commence par "${this.car.modelFirstLetter}"`);
            this.hintsUsed.modelFirstLetter = true;
        }

        return hints.length > 0 ? hints.join('\n') : 'Aucun indice supplémentaire disponible.';
    }

    /**
     * Calcule le score final
     */
    calculateFinalScore() {
        const basePoints = this.car.getBasePoints();
        const difficultyMultiplier = this.car.getDifficultyPoints();

        let finalPoints = 0;
        let difficultyPoints = 0;
        let isFullSuccess = false;

        // Vérifier si la marque a été trouvée
        const makeFound = this.isSearchingModel() && !this.makeFailed;

        if (makeFound) {
            // Marque trouvée, on peut donner des points
            finalPoints = basePoints * 0.5; // Points partiels pour la marque
            difficultyPoints = difficultyMultiplier * 0.5;
        }

        return {
            basePoints: Math.round(finalPoints * 10) / 10,
            difficultyPoints: Math.round(difficultyPoints * 10) / 10,
            isFullSuccess: false, // Sera mis à true seulement pour une victoire complète
            makeFound: makeFound
        };
    }

    /**
     * Calcule le score pour une victoire complète (marque + modèle)
     */
    calculateFullSuccessScore() {
        const basePoints = this.car.getBasePoints();
        const difficultyMultiplier = this.car.getDifficultyPoints();

        return {
            basePoints: Math.round(basePoints * 10) / 10,
            difficultyPoints: Math.round(difficultyMultiplier * 10) / 10,
            isFullSuccess: true,
            makeFound: true,
            modelFound: true
        };
    }

    /**
     * Obtient les statistiques de la partie pour la base de données
     */
    getGameStats() {
        const timeSpent = this.getTimeSpent();

        return {
            carId: this.car.id,
            startedAt: new Date(this.startTime),
            duration: Math.round(timeSpent / 1000), // en secondes
            attemptsMake: this.step === 'model' ? this.attempts : this.attempts,
            attemptsModel: this.step === 'model' ? this.attempts : 0,
            makeFound: this.step === 'model' || this.isSearchingModel(),
            modelFound: false, // À définir lors de la victoire
            carChangesUsed: this.carChangesCount,
            hintsUsed: { ...this.hintsUsed }
        };
    }

    /**
     * Convertit en JSON pour la transmission
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
            hintsUsed: this.hintsUsed,
            timeSpent: this.getTimeSpent()
        };
    }

    /**
     * Recrée un GameState depuis JSON
     */
    static fromJSON(data) {
        const gameState = new GameState(data.car, data.userId, data.username, data.threadId);

        gameState.step = data.step;
        gameState.attempts = data.attempts;
        gameState.makeFailed = data.makeFailed;
        gameState.carChangesCount = data.carChangesCount;
        gameState.startTime = data.startTime;
        gameState.hintsUsed = data.hintsUsed || {};

        return gameState;
    }
}

module.exports = GameState;
