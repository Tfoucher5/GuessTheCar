class Player {
    constructor(userId, username) {
        this.id = null;
        this.userId = userId;
        this.username = username;

        // Statistiques principales
        this.totalPoints = 0;
        this.totalDifficultyPoints = 0;
        this.gamesPlayed = 0;
        this.gamesWon = 0;

        // Statistiques détaillées
        this.correctBrandGuesses = 0;
        this.correctModelGuesses = 0;
        this.totalBrandGuesses = 0;
        this.totalModelGuesses = 0;

        // Performance
        this.bestStreak = 0;
        this.currentStreak = 0;
        this.bestTime = null;
        this.averageResponseTime = 0;

        // Métadonnées
        this.createdAt = null;
        this.updatedAt = null;
    }

    /**
     * Crée une instance Player depuis les données de base
     */
    static fromDatabase(data) {
        const player = new Player(data.user_id, data.username);

        player.id = data.id;

        // Assurer que toutes les valeurs numériques sont définies
        player.totalPoints = Number(data.total_points) || 0;
        player.totalDifficultyPoints = Number(data.total_difficulty_points) || 0;
        player.gamesPlayed = Number(data.games_played) || 0;
        player.gamesWon = Number(data.games_won) || 0;
        player.correctBrandGuesses = Number(data.correct_brand_guesses) || 0;
        player.correctModelGuesses = Number(data.correct_model_guesses) || 0;
        player.totalBrandGuesses = Number(data.total_brand_guesses) || 0;
        player.totalModelGuesses = Number(data.total_model_guesses) || 0;
        player.bestStreak = Number(data.best_streak) || 0;
        player.currentStreak = Number(data.current_streak) || 0;
        player.bestTime = data.best_time ? Number(data.best_time) : null;
        player.averageResponseTime = Number(data.average_response_time) || 0;
        player.createdAt = data.created_at;
        player.updatedAt = data.updated_at;

        return player;
    }

    /**
     * Propriétés calculées pour compatibilité avec embedBuilder
     */
    get carsGuessed() {
        return this.gamesWon;
    }

    get partialGuesses() {
        return this.gamesPlayed - this.gamesWon;
    }

    get totalGames() {
        return this.gamesPlayed;
    }

    get averageAttempts() {
        if (this.gamesPlayed === 0) return 0;
        return this.totalBrandGuesses > 0 ?
            Math.round((this.totalBrandGuesses / this.gamesPlayed) * 10) / 10 : 0;
    }

    get successRate() {
        if (this.gamesPlayed === 0) return 0;
        return Math.round((this.gamesWon / this.gamesPlayed) * 100 * 10) / 10;
    }


    updateGameStats(gameResult) {
        // TOUJOURS incrementer les parties jouées
        this.gamesPlayed++;

        // Compter les tentatives
        this.totalBrandGuesses += gameResult.attemptsMake || 0;
        this.totalModelGuesses += gameResult.attemptsModel || 0;

        // Marque trouvée ?
        if (gameResult.makeFound) {
            this.correctBrandGuesses++;
        }

        // Modèle trouvé (partie complète) ?
        if (gameResult.modelFound) {
            this.correctModelGuesses++;
            this.gamesWon++;
            this.currentStreak++;

            if (this.currentStreak > this.bestStreak) {
                this.bestStreak = this.currentStreak;
            }
        } else {
            // Réinitialiser la série si pas de victoire complète
            this.currentStreak = 0;
        }

        // Ajouter les points (même si 0)
        this.totalPoints += gameResult.pointsEarned || 0;
        this.totalDifficultyPoints += gameResult.difficultyPointsEarned || 0;

        // Mettre à jour le meilleur temps (seulement si partie complétée)
        if (gameResult.modelFound && gameResult.durationSeconds &&
            (this.bestTime === null || gameResult.durationSeconds < this.bestTime)) {
            this.bestTime = gameResult.durationSeconds;
        }

        // Log pour debug
        console.log(`[DEBUG] Player ${this.username} stats updated:`, {
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            pointsEarned: gameResult.pointsEarned || 0,
            totalPoints: this.totalDifficultyPoints,
            makeFound: gameResult.makeFound,
            modelFound: gameResult.modelFound,
            abandoned: gameResult.abandoned,
            timeout: gameResult.timeout
        });
    }

    /**
     * Obtient le niveau de compétence
     */
    getSkillLevel() {
        if (this.totalDifficultyPoints >= 50) return 'Maître';
        if (this.totalDifficultyPoints >= 25) return 'Expert';
        if (this.totalDifficultyPoints >= 15) return 'Avancé';
        if (this.totalDifficultyPoints >= 8) return 'Intermédiaire';
        if (this.totalDifficultyPoints >= 3) return 'Apprenti';
        return 'Débutant';
    }

    /**
     * Formate le temps en chaîne lisible
     */
    formatTime(seconds) {
        if (!seconds) return 'N/A';

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    }

    /**
     * Convertit en format base de données
     */
    toDatabase() {
        return {
            user_id: this.userId,
            username: this.username,
            total_points: this.totalPoints,
            total_difficulty_points: this.totalDifficultyPoints,
            games_played: this.gamesPlayed,
            games_won: this.gamesWon,
            correct_brand_guesses: this.correctBrandGuesses,
            correct_model_guesses: this.correctModelGuesses,
            total_brand_guesses: this.totalBrandGuesses,
            total_model_guesses: this.totalModelGuesses,
            best_streak: this.bestStreak,
            current_streak: this.currentStreak,
            best_time: this.bestTime,
            average_response_time: this.averageResponseTime
        };
    }

    /**
     * Convertit en JSON pour l'affichage
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            username: this.username,
            totalPoints: this.totalPoints,
            totalDifficultyPoints: this.totalDifficultyPoints,
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            successRate: this.successRate,
            averageAttempts: this.averageAttempts,
            bestStreak: this.bestStreak,
            currentStreak: this.currentStreak,
            bestTime: this.bestTime,
            skillLevel: this.getSkillLevel(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Obtient une représentation textuelle
     */
    toString() {
        return `${this.username} (${this.getSkillLevel()}) - ${this.totalDifficultyPoints} pts`;
    }
}

module.exports = Player;
