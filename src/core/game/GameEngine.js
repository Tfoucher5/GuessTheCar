const EventEmitter = require('events');
const GameState = require('./GameState');
const CarService = require('../car/CarService');
const PlayerManager = require('../player/PlayerManager');
const { checkAnswer } = require('../../shared/utils/textSimilarity');
const { validatePlayerGuess } = require('../../shared/utils/validation');
const gameConfig = require('../../shared/config/game');
const logger = require('../../shared/utils/logger');
const { GameError } = require('../../shared/errors');

class GameEngine extends EventEmitter {
    constructor() {
        super();
        this.carService = new CarService();
        this.playerManager = new PlayerManager();
        this.activeGames = new Map();
    }

    /**
     * Démarre une nouvelle partie
     */
    async startGame(userId, username, threadId) {
        try {
            // Vérifier s'il y a déjà une partie active pour ce joueur
            const existingGame = this.findActiveGameByUser(userId);
            if (existingGame) {
                throw new GameError('Vous avez déjà une partie en cours');
            }

            // Obtenir une voiture aléatoire
            const car = await this.carService.getValidRandomCar();

            // Créer l'état du jeu
            const gameState = new GameState(car, userId, username, threadId);

            // Configurer le timeout
            this.setupGameTimeout(gameState);

            // Stocker la partie active
            this.activeGames.set(threadId, gameState);

            // Émettre l'événement de début de partie
            this.emit('gameStarted', {
                gameState: gameState.toJSON(),
                car: car.toJSON()
            });

            logger.info('Game started:', {
                userId,
                username,
                threadId,
                car: car.getFullName(),
                difficulty: car.getDifficultyText()
            });

            return gameState;
        } catch (error) {
            logger.error('Error starting game:', { userId, username, threadId, error });
            throw error;
        }
    }

    /**
     * Traite une réponse du joueur
     */
    async processGuess(threadId, guess) {
        try {
            const gameState = this.activeGames.get(threadId);
            if (!gameState) {
                throw new GameError('Aucune partie active trouvée');
            }

            // Valider la réponse
            const validatedGuess = validatePlayerGuess(guess);

            // Incrémenter les essais
            gameState.incrementAttempts();

            // Réinitialiser le timeout
            this.resetGameTimeout(gameState);

            // Vérifier la réponse selon l'étape
            let result;
            if (gameState.isSearchingMake()) {
                result = await this.processMakeGuess(gameState, validatedGuess);
            } else {
                result = await this.processModelGuess(gameState, validatedGuess);
            }

            // Émettre l'événement de réponse traitée
            this.emit('guessProcessed', {
                threadId,
                gameState: gameState.toJSON(),
                guess: validatedGuess,
                result
            });

            return result;
        } catch (error) {
            logger.error('Error processing guess:', { threadId, guess, error });
            throw error;
        }
    }

    /**
     * Traite une réponse pour la marque
     */
    async processMakeGuess(gameState, guess) {
        const result = checkAnswer(guess, gameState.car.make);

        if (result.isCorrect) {
            // Marque trouvée, sauvegarder le nombre d'essais et passer au modèle
            gameState.attemptsMake = gameState.attempts;
            gameState.nextStep();

            return {
                type: 'makeSuccess',
                isCorrect: true,
                feedback: `${result.feedback}\nC'est bien ${gameState.car.make} !\nMaintenant, devine le **modèle** de cette voiture.`,
                nextStep: 'model',
                attempts: gameState.attempts,
                gameState: gameState.getStatus()
            };
        } else if (gameState.hasReachedMaxAttempts()) {
            // Échec de la marque, passer au modèle
            gameState.attemptsMake = gameState.attempts;
            gameState.setMakeFailed();

            return {
                type: 'makeFailed',
                isCorrect: false,
                feedback: `La marque était: **${gameState.car.make}**\nOn passe au modèle !`,
                nextStep: 'model',
                attempts: gameState.attempts,
                gameState: gameState.getStatus()
            };
        } else {
            // Réponse incorrecte, continuer
            const hintMessage = gameState.attempts === gameConfig.HINTS.FIRST_LETTER_ATTEMPT
                ? `\n💡 La marque commence par "${gameState.car.firstLetter}"`
                : '';

            return {
                type: 'incorrect',
                isCorrect: false,
                feedback: `${result.feedback}\n(${gameConfig.MAX_ATTEMPTS - gameState.attempts} essais restants)${hintMessage}`,
                attempts: gameState.attempts,
                gameState: gameState.getStatus()
            };
        }
    }

    /**
     * Traite une réponse pour le modèle
     */
    async processModelGuess(gameState, guess) {
        const result = checkAnswer(guess, gameState.car.model);

        if (result.isCorrect) {
            // Modèle trouvé, partie terminée avec succès
            return await this.endGameWithSuccess(gameState);
        } else if (gameState.hasReachedMaxAttempts()) {
            // Échec du modèle, partie terminée avec échec partiel
            return await this.endGameWithPartialSuccess(gameState);
        } else {
            // Réponse incorrecte, continuer
            let hintMessage = '';

            if (gameState.attempts === gameConfig.HINTS.FIRST_LETTER_ATTEMPT) {
                hintMessage = `\n💡 Le modèle commence par "${gameState.car.modelFirstLetter}"`;
            } else if (gameState.attempts === gameConfig.HINTS.LAST_LETTER_ATTEMPT) {
                const lastLetter = gameState.car.model[gameState.car.model.length - 1];
                hintMessage = `\n💡 Le modèle se termine par "${lastLetter}"`;
            }

            return {
                type: 'incorrect',
                isCorrect: false,
                feedback: `${result.feedback}\n(${gameConfig.MAX_ATTEMPTS - gameState.attempts} essais restants)${hintMessage}`,
                attempts: gameState.attempts,
                gameState: gameState.getStatus()
            };
        }
    }

    /**
     * Termine le jeu avec succès complet
     */
    async endGameWithSuccess(gameState) {
        const timeSpent = gameState.getTimeSpent();

        // Calculer les statistiques correctes
        const attemptsMake = gameState.attemptsMake || 1; // Nombre d'essais pour la marque
        const attemptsModel = gameState.attempts; // Essais actuels pour le modèle
        const totalAttempts = attemptsMake + attemptsModel;

        // Calculer le score
        const score = gameState.calculateFullSuccessScore();

        // Mettre à jour les scores du joueur avec les bonnes données
        await this.playerManager.updatePlayerScore(
            gameState.userId,
            gameState.username,
            score.basePoints,
            score.difficultyPoints,
            true, // isComplete = true pour victoire totale
            {
                carId: gameState.car.id,
                startedAt: new Date(gameState.startTime),
                duration: Math.floor(timeSpent / 1000),
                attemptsMake: attemptsMake,
                attemptsModel: attemptsModel,
                makeFound: true,
                modelFound: true,
                completed: true
            }
        );

        // Nettoyer la partie
        this.cleanupGame(gameState.threadId);

        // Émettre l'événement de fin de partie
        this.emit('gameEnded', {
            type: 'success',
            gameState: gameState.toJSON(),
            score,
            timeSpent
        });

        return {
            type: 'gameComplete',
            isCorrect: true,
            success: true,
            feedback: `🎉 Félicitations ! Vous avez trouvé ${gameState.car.getFullName()} !`,
            score,
            timeSpent,
            attempts: totalAttempts
        };
    }

    /**
     * Termine le jeu avec succès partiel (marque trouvée seulement)
     */
    async endGameWithPartialSuccess(gameState) {
        const timeSpent = gameState.getTimeSpent();

        // Seulement si la marque a été trouvée
        if (gameState.isSearchingModel() && !gameState.makeFailed) {
            const attemptsMake = gameState.attemptsMake || 1;
            const attemptsModel = gameState.attempts;
            const score = gameState.calculateFinalScore();

            await this.playerManager.updatePlayerScore(
                gameState.userId,
                gameState.username,
                score.basePoints,
                score.difficultyPoints,
                false, // isComplete = false
                {
                    carId: gameState.car.id,
                    startedAt: new Date(gameState.startTime),
                    duration: Math.floor(timeSpent / 1000),
                    attemptsMake: attemptsMake,
                    attemptsModel: attemptsModel,
                    makeFound: true,
                    modelFound: false,
                    completed: false
                }
            );

            const pointsMessage = `\nVous gagnez ${score.difficultyPoints} points pour avoir trouvé la marque.`;

            // Nettoyer la partie
            this.cleanupGame(gameState.threadId);

            return {
                type: 'gameOver',
                isCorrect: false,
                success: false,
                feedback: `⌛ Plus d'essais !\nLe modèle était: **${gameState.car.model}**${pointsMessage}`,
                score: score,
                timeSpent,
                attempts: attemptsMake + attemptsModel,
                correctAnswer: gameState.car.getFullName()
            };
        } else {
            // Aucun point si marque pas trouvée
            this.cleanupGame(gameState.threadId);

            return {
                type: 'gameOver',
                isCorrect: false,
                success: false,
                feedback: `⌛ Plus d'essais !\nLa voiture était: **${gameState.car.getFullName()}**`,
                score: null,
                timeSpent,
                attempts: gameState.attempts,
                correctAnswer: gameState.car.getFullName()
            };
        }
    }

    /**
     * Change la voiture du jeu
     */
    async changeCar(threadId) {
        try {
            const gameState = this.activeGames.get(threadId);
            if (!gameState) {
                throw new GameError('Aucune partie active trouvée');
            }

            if (!gameState.canChangeCar()) {
                throw new GameError('Limite de changements de voiture atteinte');
            }

            // Obtenir une nouvelle voiture
            const newCar = await this.carService.getValidRandomCar();

            // Mettre à jour l'état du jeu
            gameState.updateCar(newCar);
            gameState.incrementCarChanges();

            // Réinitialiser le timeout
            this.resetGameTimeout(gameState);

            // Émettre l'événement de changement de voiture
            this.emit('carChanged', {
                threadId,
                gameState: gameState.toJSON(),
                newCar: newCar.toJSON(),
                changesRemaining: gameConfig.MAX_CAR_CHANGES - gameState.carChangesCount
            });

            logger.info('Car changed in game:', {
                threadId,
                userId: gameState.userId,
                newCar: newCar.getFullName(),
                changesUsed: gameState.carChangesCount
            });

            return {
                type: 'carChanged',
                success: true,
                newCar: newCar.toJSON(),
                changesRemaining: gameConfig.MAX_CAR_CHANGES - gameState.carChangesCount,
                gameState: gameState.getStatus()
            };
        } catch (error) {
            logger.error('Error changing car:', { threadId, error });
            throw error;
        }
    }

    /**
     * Obtient un indice pour le jeu
     */
    getHint(threadId) {
        const gameState = this.activeGames.get(threadId);
        if (!gameState) {
            throw new GameError('Aucune partie active trouvée');
        }

        const hintMessage = gameState.getHintMessage();

        this.emit('hintRequested', {
            threadId,
            gameState: gameState.toJSON(),
            hint: hintMessage
        });

        return {
            type: 'hint',
            message: hintMessage,
            step: gameState.step
        };
    }

    /**
     * Abandonne une partie
     */
    async abandonGame(threadId) {
        try {
            const gameState = this.activeGames.get(threadId);
            if (!gameState) {
                throw new GameError('Aucune partie active trouvée');
            }

            // Donner des points SEULEMENT si la marque a été trouvée ET qu'on est en phase modèle
            let score = null;
            if (gameState.isSearchingModel() && !gameState.makeFailed) {
                score = gameState.calculateFinalScore();
                await this.playerManager.updatePlayerScore(
                    gameState.userId,
                    gameState.username,
                    score.basePoints,
                    score.difficultyPoints,
                    false,
                    {
                        carId: gameState.car.id,
                        startedAt: gameState.startTime,
                        duration: Math.floor(gameState.getTimeSpent() / 1000),
                        attemptsMake: gameState.attempts,
                        attemptsModel: 0,
                        makeFound: true,
                        modelFound: false,
                        abandoned: true
                    }
                );
            }

            // Nettoyer la partie
            this.cleanupGame(threadId);

            // Émettre l'événement d'abandon
            this.emit('gameAbandoned', {
                threadId,
                gameState: gameState.toJSON(),
                score
            });

            logger.info('Game abandoned:', {
                threadId,
                userId: gameState.userId,
                step: gameState.step,
                attempts: gameState.attempts
            });

            const pointsMessage = score
                ? `\nVous gagnez ${score.difficultyPoints} points pour avoir trouvé la marque.`
                : '';

            return {
                type: 'abandoned',
                correctAnswer: gameState.car.getFullName(),
                score,
                message: `🏳️ Partie abandonnée\nLa voiture était : ${gameState.car.getFullName()}${pointsMessage}`
            };
        } catch (error) {
            logger.error('Error abandoning game:', { threadId, error });
            throw error;
        }
    }

    /**
     * Termine une partie manuellement
     */
    async endGame(threadId) {
        return await this.abandonGame(threadId);
    }

    /**
     * Gère le timeout d'une partie
    */
    async handleGameTimeout(threadId) {
        try {
            const gameState = this.activeGames.get(threadId);
            if (!gameState) {
                return; // Partie déjà nettoyée
            }

            // Donner des points SEULEMENT si la marque a été trouvée ET qu'on est en phase modèle
            let score = null;
            if (gameState.isSearchingModel() && !gameState.makeFailed) {
                score = gameState.calculateFinalScore();
                await this.playerManager.updatePlayerScore(
                    gameState.userId,
                    gameState.username,
                    score.basePoints,
                    score.difficultyPoints,
                    false,
                    {
                        carId: gameState.car.id,
                        startedAt: gameState.startTime,
                        duration: Math.floor(gameState.getTimeSpent() / 1000),
                        attemptsMake: gameState.attempts,
                        attemptsModel: 0,
                        makeFound: true,
                        modelFound: false,
                        timeout: true
                    }
                );
            }

            // Nettoyer la partie
            this.cleanupGame(threadId);

            // Émettre l'événement de timeout
            this.emit('gameTimeout', {
                threadId,
                gameState: gameState.toJSON(),
                score
            });

            logger.info('Game timeout:', {
                threadId,
                userId: gameState.userId,
                step: gameState.step,
                attempts: gameState.attempts
            });

            const pointsMessage = score
                ? `\nVous gagnez ${score.difficultyPoints} points pour avoir trouvé la marque.`
                : '';

            return {
                type: 'timeout',
                correctAnswer: gameState.car.getFullName(),
                score,
                message: `⏰ Temps écoulé\nLa partie a été abandonnée après 5 minutes d'inactivité.\nLa voiture était: ${gameState.car.getFullName()}${pointsMessage}`
            };
        } catch (error) {
            logger.error('Error handling game timeout:', { threadId, error });
            // Nettoyer la partie même en cas d'erreur
            this.cleanupGame(threadId);
        }
    }

    /**
     * Configure le timeout pour une partie
     */
    setupGameTimeout(gameState) {
        if (gameState.timeoutId) {
            clearTimeout(gameState.timeoutId);
        }

        gameState.timeoutId = setTimeout(() => {
            this.handleGameTimeout(gameState.threadId);
        }, gameConfig.GAME_TIMEOUT);
    }

    /**
     * Réinitialise le timeout d'une partie
     */
    resetGameTimeout(gameState) {
        this.setupGameTimeout(gameState);
    }

    /**
     * Nettoie une partie (supprime du cache et timeout)
     */
    cleanupGame(threadId) {
        const gameState = this.activeGames.get(threadId);
        if (gameState && gameState.timeoutId) {
            clearTimeout(gameState.timeoutId);
        }
        this.activeGames.delete(threadId);
    }

    /**
     * Trouve une partie active par utilisateur
     */
    findActiveGameByUser(userId) {
        for (const [threadId, gameState] of this.activeGames) {
            if (gameState.userId === userId) {
                return { threadId, gameState };
            }
        }
        return null;
    }

    /**
     * Obtient une partie active
     */
    getActiveGame(threadId) {
        return this.activeGames.get(threadId);
    }

    /**
     * Obtient toutes les parties actives
     */
    getAllActiveGames() {
        return Array.from(this.activeGames.entries()).map(([threadId, gameState]) => ({
            threadId,
            gameState: gameState.toJSON()
        }));
    }

    /**
     * Obtient le nombre de parties actives
     */
    getActiveGameCount() {
        return this.activeGames.size;
    }

    /**
     * Nettoie toutes les parties actives
     */
    cleanupAllGames() {
        for (const [threadId, gameState] of this.activeGames) {
            if (gameState.timeoutId) {
                clearTimeout(gameState.timeoutId);
            }
        }
        this.activeGames.clear();
        logger.info('All active games cleaned up');
    }

    /**
     * Obtient les statistiques du moteur de jeu
     */
    getEngineStats() {
        const games = Array.from(this.activeGames.values());

        return {
            activeGames: games.length,
            gamesByStep: {
                make: games.filter(g => g.isSearchingMake()).length,
                model: games.filter(g => g.isSearchingModel()).length
            },
            averageAttempts: games.length > 0
                ? games.reduce((sum, g) => sum + g.attempts, 0) / games.length
                : 0,
            averageTimeSpent: games.length > 0
                ? games.reduce((sum, g) => sum + g.getTimeSpent(), 0) / games.length
                : 0
        };
    }

    /**
     * Sauvegarde l'état des parties actives (pour redémarrage)
     */
    saveActiveGamesState() {
        const gamesData = {};
        for (const [threadId, gameState] of this.activeGames) {
            gamesData[threadId] = gameState.toJSON();
        }
        return gamesData;
    }

    /**
     * Restaure l'état des parties actives (après redémarrage)
     */
    restoreActiveGamesState(gamesData) {
        this.cleanupAllGames();

        for (const [threadId, gameData] of Object.entries(gamesData)) {
            try {
                // Recréer l'état du jeu
                const car = this.carService.createCarFromData(gameData.car);
                const gameState = new GameState(car, gameData.userId, gameData.username, threadId);

                // Restaurer l'état
                gameState.step = gameData.step;
                gameState.attempts = gameData.attempts;
                gameState.makeFailed = gameData.makeFailed;
                gameState.carChangesCount = gameData.carChangesCount;
                gameState.startTime = gameData.startTime;
                gameState.hintsUsed = gameData.hintsUsed;

                // Reconfigurer le timeout
                this.setupGameTimeout(gameState);

                this.activeGames.set(threadId, gameState);

                logger.info('Game state restored:', { threadId, userId: gameData.userId });
            } catch (error) {
                logger.error('Error restoring game state:', { threadId, error });
            }
        }

        logger.info('Active games state restored:', { count: this.activeGames.size });
    }
}

module.exports = GameEngine;
