// src/core/player/Player.js

class Player {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.user_id || data.userId || null;
        this.username = data.username || '';
        this.totalPoints = parseFloat(data.total_points || data.totalPoints || 0);
        this.gamesPlayed = parseInt(data.games_played || data.gamesPlayed || 0);
        this.gamesWon = parseInt(data.games_won || data.gamesWon || 0);
        this.correctBrandGuesses = parseInt(data.correct_brand_guesses || data.correctBrandGuesses || 0);
        this.correctModelGuesses = parseInt(data.correct_model_guesses || data.correctModelGuesses || 0);
        this.totalBrandGuesses = parseInt(data.total_brand_guesses || data.totalBrandGuesses || 0);
        this.totalModelGuesses = parseInt(data.total_model_guesses || data.totalModelGuesses || 0);
        this.bestStreak = parseInt(data.best_streak || data.bestStreak || 0);
        this.currentStreak = parseInt(data.current_streak || data.currentStreak || 0);
        this.bestTime = data.best_time || data.bestTime || null;
        this.averageResponseTime = parseFloat(data.average_response_time || data.averageResponseTime || 0);
        this.createdAt = data.created_at || data.createdAt || null;
        this.updatedAt = data.updated_at || data.updatedAt || null;

        // Système de prestige
        this.prestigeLevel = parseInt(data.prestige_level || data.prestigeLevel || 0);
        this.prestigePoints = parseFloat(data.prestige_points || data.prestigePoints || 0);
    }

    /**
     * Calcule le pourcentage de victoires
     */
    get winRate() {
        if (this.gamesPlayed === 0) return 0;
        return (this.gamesWon / this.gamesPlayed) * 100;
    }

    /**
     * Calcule le pourcentage de réussite des marques
     */
    get brandSuccessRate() {
        if (this.totalBrandGuesses === 0) return 0;
        return (this.correctBrandGuesses / this.totalBrandGuesses) * 100;
    }

    /**
     * Calcule le pourcentage de réussite des modèles
     */
    get modelSuccessRate() {
        if (this.totalModelGuesses === 0) return 0;
        return (this.correctModelGuesses / this.totalModelGuesses) * 100;
    }

    /**
     * Détermine le niveau de compétence du joueur basé sur les points totaux
     * Utilise maintenant le système de niveaux de la DB (via LevelSystem)
     */
    get skillLevel() {
        // Classification simplifiée basée sur les points totaux
        if (this.totalPoints >= 1000) return 'Expert';
        if (this.totalPoints >= 500) return 'Avancé';
        if (this.totalPoints >= 100) return 'Intermédiaire';
        return 'Débutant';
    }

    /**
     * Obtient la moyenne de tentatives par partie
     */
    get averageAttempts() {
        if (this.gamesPlayed === 0) return 0;
        return (this.totalBrandGuesses + this.totalModelGuesses) / this.gamesPlayed;
    }

    /**
     * Vérifie si le joueur est actif (a joué récemment)
     */
    get isActive() {
        if (!this.updatedAt) return false;
        const lastActivity = new Date(this.updatedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActivity > thirtyDaysAgo;
    }

    /**
     * Convertit vers le format base de données
     */
    toDatabase() {
        return {
            id: this.id,
            user_id: this.userId,
            username: this.username,
            total_points: this.totalPoints,
            games_played: this.gamesPlayed,
            games_won: this.gamesWon,
            correct_brand_guesses: this.correctBrandGuesses,
            correct_model_guesses: this.correctModelGuesses,
            total_brand_guesses: this.totalBrandGuesses,
            total_model_guesses: this.totalModelGuesses,
            best_streak: this.bestStreak,
            current_streak: this.currentStreak,
            best_time: this.bestTime,
            average_response_time: this.averageResponseTime,
            prestige_level: this.prestigeLevel,
            prestige_points: this.prestigePoints,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        };
    }

    /**
     * Convertit vers le format API
     */
    toAPI() {
        return {
            id: this.id,
            userId: this.userId,
            username: this.username,
            totalPoints: this.totalPoints,
            prestigeLevel: this.prestigeLevel,
            prestigePoints: this.prestigePoints,
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            winRate: this.winRate,
            correctBrandGuesses: this.correctBrandGuesses,
            correctModelGuesses: this.correctModelGuesses,
            totalBrandGuesses: this.totalBrandGuesses,
            totalModelGuesses: this.totalModelGuesses,
            brandSuccessRate: this.brandSuccessRate,
            modelSuccessRate: this.modelSuccessRate,
            bestStreak: this.bestStreak,
            currentStreak: this.currentStreak,
            bestTime: this.bestTime,
            averageResponseTime: this.averageResponseTime,
            averageAttempts: this.averageAttempts,
            skillLevel: this.skillLevel,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Met à jour les statistiques du joueur après une partie
     */
    updateGameStats(gameSession) {
        // Ajouter les points
        this.totalPoints += gameSession.pointsEarned || 0;

        // Incrémenter les parties jouées
        this.gamesPlayed += 1;

        // Compter les victoires
        if (gameSession.completed && !gameSession.abandoned) {
            this.gamesWon += 1;
            this.currentStreak += 1;

            // Mettre à jour le meilleur streak
            if (this.currentStreak > this.bestStreak) {
                this.bestStreak = this.currentStreak;
            }
        } else {
            // Réinitialiser le streak en cas d'échec
            this.currentStreak = 0;
        }

        // Compter les tentatives et réussites de marques
        if (gameSession.attemptsMake > 0) {
            this.totalBrandGuesses += gameSession.attemptsMake;
            if (gameSession.makeFound) {
                this.correctBrandGuesses += 1;
            }
        }

        // Compter les tentatives et réussites de modèles
        if (gameSession.attemptsModel > 0) {
            this.totalModelGuesses += gameSession.attemptsModel;
            if (gameSession.modelFound) {
                this.correctModelGuesses += 1;
            }
        }

        // Mettre à jour le temps de réponse si disponible
        if (gameSession.durationSeconds && gameSession.completed) {
            // Mettre à jour le meilleur temps
            if (!this.bestTime || gameSession.durationSeconds < this.bestTime) {
                this.bestTime = gameSession.durationSeconds;
            }

            // Mettre à jour le temps de réponse moyen
            if (this.gamesWon > 1) {
                this.averageResponseTime = ((this.averageResponseTime * (this.gamesWon - 1)) + gameSession.durationSeconds) / this.gamesWon;
            } else {
                this.averageResponseTime = gameSession.durationSeconds;
            }
        }

        // Mettre à jour le timestamp
        this.updatedAt = new Date();
    }
    /**
     * Réinitialise toutes les statistiques
     */
    resetStats() {
        this.totalPoints = 0;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.correctBrandGuesses = 0;
        this.correctModelGuesses = 0;
        this.totalBrandGuesses = 0;
        this.totalModelGuesses = 0;
        this.bestStreak = 0;
        this.currentStreak = 0;
        this.bestTime = null;
        this.averageResponseTime = 0;
        this.updatedAt = new Date();
    }

    /**
     * Valide les données du joueur
     */
    validate() {
        const errors = [];

        if (!this.userId) {
            errors.push('User ID requis');
        }

        if (!this.username || this.username.length < 1 || this.username.length > 32) {
            errors.push('Username requis (1-32 caractères)');
        }

        if (this.totalPoints < 0) {
            errors.push('Total points ne peut pas être négatif');
        }

        if (this.gamesPlayed < 0) {
            errors.push('Nombre de parties ne peut pas être négatif');
        }

        if (this.gamesWon > this.gamesPlayed) {
            errors.push('Parties gagnées ne peut pas dépasser parties jouées');
        }

        return errors;
    }

    /**
     * Clône le joueur
     */
    clone() {
        return new Player(this.toDatabase());
    }

    /**
     * Méthodes statiques
     */

    /**
     * Crée un Player depuis les données de base
     */
    static fromDatabase(data) {
        return new Player(data);
    }

    /**
     * Crée un nouveau joueur avec les valeurs par défaut
     */
    static createNew(userId, username) {
        return new Player({
            user_id: userId,
            username: username,
            total_points: 0,
            total_difficulty_points: 0,
            games_played: 0,
            games_won: 0,
            correct_brand_guesses: 0,
            correct_model_guesses: 0,
            total_brand_guesses: 0,
            total_model_guesses: 0,
            best_streak: 0,
            current_streak: 0,
            best_time: null,
            average_response_time: 0,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    /**
     * Compare deux joueurs pour le classement - CORRIGÉ
     */
    static compare(playerA, playerB) {
        // 1. Tri par POINTS TOTAUX décroissant (principal critère)
        if (playerA.totalPoints !== playerB.totalPoints) {
            return playerB.totalPoints - playerA.totalPoints;
        }

        // 2. En cas d'égalité : parties gagnées décroissant
        if (playerA.gamesWon !== playerB.gamesWon) {
            return playerB.gamesWon - playerA.gamesWon;
        }

        // 3. En cas d'égalité : meilleur temps croissant (plus rapide = mieux)
        const timeA = playerA.bestTime || Number.MAX_SAFE_INTEGER;
        const timeB = playerB.bestTime || Number.MAX_SAFE_INTEGER;

        if (timeA !== timeB) {
            return timeA - timeB;
        }

        // 4. Tie-breaker final : taux de réussite décroissant
        const rateA = playerA.gamesPlayed > 0 ? (playerA.gamesWon / playerA.gamesPlayed) : 0;
        const rateB = playerB.gamesPlayed > 0 ? (playerB.gamesWon / playerB.gamesPlayed) : 0;

        return rateB - rateA;
    }
}

module.exports = Player;
