const EventEmitter = require('events');
const GameState = require('./GameState');
const CarService = require('../car/CarService');
const PlayerManager = require('../player/PlayerManager');
const { checkAnswer } = require('../../shared/utils/textSimilarity');
const { validatePlayerGuess } = require('../../shared/utils/validation');
const gameConfig = require('../../shared/config/game');
const logger = require('../../shared/utils/logger');
const { GameError } = require('../../shared/errors');
const statsHelper = require('../../shared/utils/StatsHelper');

class GameEngine extends EventEmitter {
    constructor() {
        super();
        this.carService = new CarService();
        this.playerManager = new PlayerManager();
        this.activeGames = new Map();
    }

    async logGameAction(action, gameState) {
        try {
            await statsHelper.logGame(action, gameState.threadId, gameState.userId);
        } catch (err) {
            logger.error('Failed to log game action to API', { action, err });
        }
    }

    /**
 * Démarre une nouvelle partie avec guildId
 */
    async startGame(userId, username, threadId, guildId = null) {
        try {
            const existingGame = this.findActiveGameByUser(userId);
            if (existingGame) {
                throw new GameError('Vous avez déjà une partie en cours');
            }

            const car = await this.carService.getValidRandomCar();

            // MODIFIÉ: Passer guildId au GameState
            const gameState = new GameState(car, userId, username, threadId, guildId);

            this.setupGameTimeout(gameState);
            this.activeGames.set(threadId, gameState);

            this.emit('gameStarted', {
                gameState: gameState.toJSON(),
                car: car.toJSON()
            });

            logger.info('Game started:', {
                userId, username, threadId, guildId,
                car: car.getFullName(),
                difficulty: car.getDifficultyText()
            });

            return gameState;
        } catch (error) {
            logger.error('Error starting game:', { userId, username, threadId, guildId, error });
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

            // === AJOUT : Gestion de la validation ===
            let validatedGuess;
            try {
                validatedGuess = validatePlayerGuess(guess);
            } catch (validationError) {
                // Retourner un résultat spécial pour l'erreur de validation
                return {
                    type: 'validation_error',
                    isCorrect: false,
                    feedback: '❌ **Caractères non autorisés !**\n\n🔤 Utilisez uniquement : **lettres, chiffres, espaces et tirets**\n\nExemples valides : `BMW`, `Audi A4`, `Mercedes-Benz`',
                    error: validationError.message
                };
            }

            // Incrémenter les essais seulement si la validation passe
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
            gameState.nextStep(); // Utilise nextStep qui remet attempts à 0

            return {
                type: 'makeSuccess',
                isCorrect: true,
                feedback: `${result.feedback}\nC'est bien ${gameState.car.brand} !\nMaintenant, devine le **modèle** de cette **${gameState.car.brand}**.`,
                nextStep: 'model',
                attempts: gameState.attempts, // Maintenant 0
                gameState: gameState.getStatus()
            };
        } else if (gameState.hasReachedMaxAttempts()) {
            // Échec de la marque, sauvegarder les essais et passer au modèle
            gameState.attemptsMake = gameState.attempts;
            gameState.setMakeFailed(); // Maintenant remet attempts à 0

            return {
                type: 'makeFailed',
                isCorrect: false,
                feedback: `La marque était: **${gameState.car.brand}**\nMaintenant, essayez de deviner le **modèle** de cette **${gameState.car.brand}** !\n\n🎯 Vous avez ${gameConfig.MAX_ATTEMPTS} nouveaux essais pour le modèle.`,
                nextStep: 'model',
                attempts: gameState.attempts, // Maintenant 0
                gameState: gameState.getStatus()
            };
        } else {
            // Le reste reste identique...
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
 * Termine le jeu avec succès - MODIFIÉ pour inclure guildId
 */
    // Correction simplifiée pour GameEngine.js

    async endGameWithSuccess(gameState) {
        const timeSpent = gameState.getTimeSpent();
        const attemptsMake = gameState.attemptsMake || 1;
        const attemptsModel = gameState.attempts;
        const totalAttempts = attemptsMake + attemptsModel;

        // Calculer le score amélioré
        let score;
        try {
            score = gameState.calculateEnhancedScore();
            console.log('Enhanced score calculated:', score);
        } catch (error) {
            logger.warn('Error calculating enhanced score, falling back to simple score:', error.message);
            score = gameState.calculateFullSuccessScore();
            score.difficultyName = gameState.car.getDifficultyText();
            score.carName = gameState.car.getFullName();
            console.log('Fallback score calculated:', score);
        }

        // ✅ SIMPLIFIÉ: Maintenant on a toujours basePoints ET difficultyPoints
        const basePoints = score.basePoints || 0;
        const difficultyPoints = score.difficultyPoints || 0;

        console.log('GameEngine.endGameWithSuccess - Score breakdown:', {
            basePoints,
            difficultyPoints,
            totalPoints: score.totalPoints
        });

        // ✅ Passer les points séparément
        await this.playerManager.updatePlayerScore(
            gameState.userId,
            gameState.username,
            basePoints,
            difficultyPoints,
            true,
            {
                guildId: gameState.guildId,
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

        await this.playerManager.recordCarFound(
            gameState.userId,
            gameState.car,
            {
                guildId: gameState.guildId,
                attemptsMake: attemptsMake,
                attemptsModel: attemptsModel,
                duration: Math.floor(timeSpent / 1000)
            }
        );

        await this.logGameAction('complete', gameState);
        this.cleanupGame(gameState.threadId);

        return {
            type: 'gameComplete',
            isCorrect: true,
            success: true,
            feedback: `🎉 Félicitations !\nVous avez trouvé la **${gameState.car.getFullName()}** !`,
            score,
            timeSpent,
            attempts: totalAttempts,
            car: gameState.car
        };
    }

    /**
     * Termine le jeu avec succès partiel (marque trouvée seulement) OU échec total modèle
     */
    async endGameWithPartialSuccess(gameState) {
        const timeSpent = gameState.getTimeSpent();

        if (gameState.isSearchingModel() && !gameState.makeFailed) {
            // CAS 1: Marque trouvée, modèle échoué - Succès partiel avec points
            const attemptsMake = gameState.attemptsMake || 1;
            const attemptsModel = gameState.attempts;
            const totalAttempts = attemptsMake + attemptsModel;

            // ✅ CORRIGÉ: Utiliser le système amélioré pour le succès partiel aussi
            let score;
            try {
                // Pour le succès partiel, on modifie les données du jeu
                const partialGameData = {
                    car: gameState.car,
                    timeSpent: timeSpent,
                    totalAttempts: totalAttempts,
                    hintsUsed: Object.values(gameState.hintsUsed).filter(used => used).length,
                    carChanges: gameState.carChangesCount,
                    isComplete: false,  // ✅ Pas de succès complet
                    makeFound: true,    // ✅ Marque trouvée
                    modelFound: false   // ✅ Modèle pas trouvé
                };

                const EnhancedScoreCalculator = require('../../shared/utils/EnhancedScoreCalculator');
                const calculator = new EnhancedScoreCalculator();
                score = calculator.calculateEnhancedScore(partialGameData);

                console.log('Enhanced partial score calculated:', score);
            } catch (error) {
                logger.warn('Error calculating enhanced partial score, falling back to simple score:', error.message);
                score = gameState.calculateFinalScore();
                console.log('Fallback partial score calculated:', score);
            }

            score.difficultyName = gameState.car.getDifficultyText();
            score.carName = gameState.car.getFullName();

            // ✅ SIMPLIFIÉ: Maintenant on a toujours basePoints ET difficultyPoints
            const basePoints = score.basePoints || 0;
            const difficultyPoints = score.difficultyPoints || 0;

            console.log('GameEngine.endGameWithPartialSuccess - Score breakdown:', {
                basePoints,
                difficultyPoints,
                totalPoints: score.totalPoints
            });

            // ✅ Passer les points séparément
            await this.playerManager.updatePlayerScore(
                gameState.userId,
                gameState.username,
                basePoints,
                difficultyPoints,
                false, // Pas de succès complet
                {
                    guildId: gameState.guildId,
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

            await this.logGameAction('complete', gameState);
            this.cleanupGame(gameState.threadId);

            return {
                type: 'gameOver',
                isCorrect: false,
                success: false,
                feedback: `⌛ Plus d'essais !\nLa voiture était la **${gameState.car.getFullName()}**.\n\nVous avez trouvé la marque, vous gagnez ${(basePoints + difficultyPoints).toFixed(1)} points totaux (${basePoints.toFixed(1)} + ${difficultyPoints.toFixed(1)} bonus) !`,
                score,
                timeSpent,
                attempts: totalAttempts,
                car: gameState.car
            };
        } else {
            // CAS 2: Marque ET modèle échoués - Échec total sans points
            const totalAttempts = gameConfig.MAX_ATTEMPTS + gameState.attempts;

            console.log('GameEngine.endGameWithPartialSuccess - Total failure, no points');

            await this.playerManager.updatePlayerScore(
                gameState.userId,
                gameState.username,
                0,  // Pas de points de base
                0,  // Pas de points de difficulté
                false,
                {
                    guildId: gameState.guildId,
                    carId: gameState.car.id,
                    startedAt: new Date(gameState.startTime),
                    duration: Math.floor(timeSpent / 1000),
                    attemptsMake: gameConfig.MAX_ATTEMPTS,
                    attemptsModel: gameState.attempts,
                    makeFound: false,
                    modelFound: false,
                    completed: false
                }
            );

            await this.logGameAction('abandon', gameState);
            this.cleanupGame(gameState.threadId);

            return {
                type: 'gameOver',
                isCorrect: false,
                success: false,
                feedback: `😞 Plus d'essais !\nLa voiture était la **${gameState.car.getFullName()}**.\n\nAucun point gagné.`,
                timeSpent,
                attempts: totalAttempts,
                car: gameState.car
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
 * Correction pour abandonGame - Toujours compter la partie
 */
    async abandonGame(threadId) {
        try {
            const gameState = this.getActiveGame(threadId);
            if (!gameState) {
                throw new GameError('Aucune partie active à abandonner');
            }

            // Calculer les points de consolation si la marque a été trouvée
            let score = null;
            if (!gameState.makeFailed && gameState.isSearchingModel()) {
                score = gameState.calculateFinalScore();

                // ✅ CORRIGÉ: Inclure guildId dans les gameStats
                await this.playerManager.updatePlayerScore(
                    gameState.userId,
                    gameState.username,
                    score.basePoints,
                    score.difficultyPoints,
                    false,
                    {
                        guildId: gameState.guildId, // ✅ AJOUTÉ LE guildId ICI !
                        carId: gameState.car.id,
                        startedAt: new Date(gameState.startTime),
                        duration: Math.floor(gameState.getTimeSpent() / 1000),
                        attemptsMake: gameState.attemptsMake || 1,
                        attemptsModel: gameState.attempts,
                        makeFound: true,
                        modelFound: false,
                        completed: false,
                        abandoned: true
                    }
                );
            } else {
                // Aucune marque trouvée - compter quand même la partie
                // ✅ CORRIGÉ: Inclure guildId dans les gameStats
                await this.playerManager.updatePlayerScore(
                    gameState.userId,
                    gameState.username,
                    0,
                    0,
                    false,
                    {
                        guildId: gameState.guildId, // ✅ AJOUTÉ LE guildId ICI !
                        carId: gameState.car.id,
                        startedAt: new Date(gameState.startTime),
                        duration: Math.floor(gameState.getTimeSpent() / 1000),
                        attemptsMake: gameState.attemptsMake || gameState.attempts,
                        attemptsModel: gameState.isSearchingModel() ? gameState.attempts : 0,
                        makeFound: false,
                        modelFound: false,
                        completed: false,
                        abandoned: true
                    }
                );
            }

            await this.logGameAction('abandon', gameState);
            this.cleanupGame(threadId);

            return {
                type: 'abandoned',
                correctAnswer: gameState.car.getFullName(),
                score,
                timeSpent: gameState.getTimeSpent()
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
 * Gère le timeout d'une partie - Toujours compter
 */
    async handleGameTimeout(threadId) {
        try {
            const gameState = this.activeGames.get(threadId);
            if (!gameState) {
                return;
            }

            let score = null;

            if (gameState.isSearchingModel() && !gameState.makeFailed) {
                // Timeout après avoir trouvé la marque
                score = gameState.calculateFinalScore();

                // ✅ CORRIGÉ: Inclure guildId dans les gameStats
                await this.playerManager.updatePlayerScore(
                    gameState.userId,
                    gameState.username,
                    score.basePoints,
                    score.difficultyPoints,
                    false,
                    {
                        guildId: gameState.guildId, // ✅ AJOUTÉ LE guildId ICI !
                        carId: gameState.car.id,
                        startedAt: new Date(gameState.startTime),
                        duration: Math.floor(gameState.getTimeSpent() / 1000),
                        attemptsMake: gameState.attemptsMake || 1,
                        attemptsModel: gameState.attempts,
                        makeFound: true,
                        modelFound: false,
                        completed: false,
                        timeout: true
                    }
                );
            } else {
                // Timeout sans avoir trouvé la marque
                // ✅ CORRIGÉ: Inclure guildId dans les gameStats
                await this.playerManager.updatePlayerScore(
                    gameState.userId,
                    gameState.username,
                    0,
                    0,
                    false,
                    {
                        guildId: gameState.guildId, // ✅ AJOUTÉ LE guildId ICI !
                        carId: gameState.car.id,
                        startedAt: new Date(gameState.startTime),
                        duration: Math.floor(gameState.getTimeSpent() / 1000),
                        attemptsMake: gameState.attemptsMake || gameState.attempts,
                        attemptsModel: 0,
                        makeFound: false,
                        modelFound: false,
                        completed: false,
                        timeout: true
                    }
                );
            }

            await this.logGameAction('timeout', gameState);
            this.cleanupGame(threadId);

            this.emit('gameTimeout', {
                threadId,
                gameState: gameState.toJSON(),
                score
            });

            return {
                type: 'timeout',
                correctAnswer: gameState.car.getFullName(),
                score,
                timeSpent: gameState.getTimeSpent()
            };

        } catch (error) {
            logger.error('Error handling game timeout:', { threadId, error });
            throw error;
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
        for (const [gameState] of this.activeGames) {
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
