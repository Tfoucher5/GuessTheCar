// src/shared/database/repositories/PlayerRepository.js
const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Player = require('../../../core/player/Player');

class PlayerRepository extends BaseRepository {
    constructor() {
        super('user_scores');
    }

    /**
 * Crée un nouveau joueur avec les valeurs par défaut
 */
    async create(userId, username) {
        const query = `
        INSERT INTO user_scores (
            user_id, 
            username, 
            total_points, 
            total_difficulty_points, 
            games_played, 
            games_won, 
            correct_brand_guesses, 
            correct_model_guesses, 
            total_brand_guesses, 
            total_model_guesses, 
            best_streak, 
            current_streak, 
            best_time, 
            average_response_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            userId,
            username,
            0,    // total_points
            0,    // total_difficulty_points
            0,    // games_played
            0,    // games_won
            0,    // correct_brand_guesses
            0,    // correct_model_guesses
            0,    // total_brand_guesses
            0,    // total_model_guesses
            0,    // best_streak
            0,    // current_streak
            null, // best_time
            0     // average_response_time
        ];

        await executeQuery(query, params);

        // Retourner le joueur créé
        return await this.findByUserId(userId);
    }

    /**
     * Trouve un joueur par user_id
     */
    async findByUserId(userId) {
        const query = 'SELECT * FROM user_scores WHERE user_id = ?';
        const results = await executeQuery(query, [userId]);

        if (results.length === 0) {
            return null;
        }

        return Player.fromDatabase(results[0]);
    }

    /**
     * Obtient ou crée un joueur
     */
    async findOrCreate(userId, username) {
        let player = await this.findByUserId(userId);

        if (!player) {
            // Créer le joueur avec la méthode spécialisée
            player = await this.create(userId, username);
        } else if (player.username !== username) {
            // Mettre à jour le nom d'utilisateur si nécessaire
            player.username = username;
            await this.updatePlayerStats(userId, player);
        }

        return player;
    }

    /**
 * Met à jour les statistiques d'un joueur
 */
    async updatePlayerStats(userId, stats) {
        const query = `
        UPDATE user_scores SET
            username = ?,
            total_points = ?,
            total_difficulty_points = ?,
            games_played = ?,
            games_won = ?,
            correct_brand_guesses = ?,
            correct_model_guesses = ?,
            total_brand_guesses = ?,
            total_model_guesses = ?,
            best_streak = ?,
            current_streak = ?,
            best_time = ?,
            average_response_time = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    `;

        const params = [
            stats.username,
            stats.total_points || stats.totalPoints || 0,
            stats.total_difficulty_points || stats.totalDifficultyPoints || 0,
            stats.games_played || stats.gamesPlayed || 0,
            stats.games_won || stats.gamesWon || 0,
            stats.correct_brand_guesses || stats.correctBrandGuesses || 0,
            stats.correct_model_guesses || stats.correctModelGuesses || 0,
            stats.total_brand_guesses || stats.totalBrandGuesses || 0,
            stats.total_model_guesses || stats.totalModelGuesses || 0,
            stats.best_streak || stats.bestStreak || 0,
            stats.current_streak || stats.currentStreak || 0,
            stats.best_time || stats.bestTime || null,
            stats.average_response_time || stats.averageResponseTime || 0,
            userId
        ];

        await executeQuery(query, params);

        // Retourner le joueur mis à jour
        return await this.findByUserId(userId);
    }

    /**
     * Récupère le classement des joueurs
     */
    async getLeaderboard(limit = 10) {
        const query = `
            SELECT 
                us.*,
                ROW_NUMBER() OVER (ORDER BY us.total_difficulty_points DESC, us.games_won DESC) as ranking
            FROM user_scores us
            WHERE us.games_played > 0
            ORDER BY us.total_difficulty_points DESC, us.games_won DESC
            LIMIT ?
        `;

        const results = await executeQuery(query, [limit]);
        return results.map(row => ({
            ...Player.fromDatabase(row),
            ranking: row.ranking
        }));
    }

    /**
     * Obtient les statistiques d'un joueur avec son classement
     */
    async getPlayerWithRanking(userId) {
        const query = `
            SELECT 
                us.*,
                (
                    SELECT COUNT(*) + 1 
                    FROM user_scores us2 
                    WHERE us2.total_difficulty_points > us.total_difficulty_points
                    OR (us2.total_difficulty_points = us.total_difficulty_points AND us2.games_won > us.games_won)
                ) as ranking,
                CASE 
                    WHEN us.total_difficulty_points >= 100 THEN 'Expert'
                    WHEN us.total_difficulty_points >= 50 THEN 'Avancé'
                    WHEN us.total_difficulty_points >= 20 THEN 'Intermédiaire'
                    ELSE 'Débutant'
                END as skill_level,
                CASE 
                    WHEN us.total_brand_guesses > 0 THEN ROUND((us.correct_brand_guesses / us.total_brand_guesses) * 100, 1)
                    ELSE 0 
                END as success_rate
            FROM user_scores us
            WHERE us.user_id = ?
        `;

        const results = await executeQuery(query, [userId]);

        if (results.length === 0) {
            return null;
        }

        const row = results[0];
        return {
            ...Player.fromDatabase(row),
            ranking: row.ranking,
            skillLevel: row.skill_level,
            successRate: parseFloat(row.success_rate) || 0
        };
    }

    /**
 * Enregistre une session de jeu
 */
    async saveGameSession(sessionData) {
        const query = `
        INSERT INTO game_sessions (
            user_id, car_id, started_at, ended_at, duration_seconds,
            attempts_make, attempts_model, make_found, model_found,
            completed, abandoned, timeout, car_changes_used, hints_used,
            points_earned, difficulty_points_earned
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        // FIX CRITIQUE: Gestion correcte de hintsUsed
        let hintsUsedJson = null;
        if (sessionData.hintsUsed) {
            if (typeof sessionData.hintsUsed === 'object') {
                // Convertir l'objet en JSON, même s'il est vide
                hintsUsedJson = JSON.stringify(sessionData.hintsUsed);
            } else if (typeof sessionData.hintsUsed === 'string') {
                hintsUsedJson = sessionData.hintsUsed;
            }
        }

        // Si hintsUsedJson est toujours null, utiliser un objet vide JSON
        if (hintsUsedJson === null) {
            hintsUsedJson = '{}';
        }

        const params = [
            sessionData.userId,
            sessionData.carId,
            sessionData.startedAt,
            sessionData.endedAt,
            sessionData.durationSeconds,
            sessionData.attemptsMake || 0,
            sessionData.attemptsModel || 0,
            sessionData.makeFound ? 1 : 0,  // FIX: Convertir boolean en int
            sessionData.modelFound ? 1 : 0, // FIX: Convertir boolean en int
            sessionData.completed ? 1 : 0,  // FIX: Convertir boolean en int
            sessionData.abandoned ? 1 : 0,  // FIX: Convertir boolean en int
            sessionData.timeout ? 1 : 0,    // FIX: Convertir boolean en int
            sessionData.carChangesUsed || 0,
            hintsUsedJson, // ✅ CORRIGÉ : Toujours une string JSON valide
            sessionData.pointsEarned || 0,
            sessionData.difficultyPointsEarned || 0
        ];

        console.log('DEBUG saveGameSession params:', params); // Pour debug

        await executeQuery(query, params);
    }

    /**
     * Met à jour le score après une partie
     */
    async updatePlayerAfterGame(userId, gameResult) {
        const player = await this.findByUserId(userId);
        if (!player) return null;

        // Calcul des nouvelles statistiques
        const newStats = {
            ...player,
            totalPoints: player.totalPoints + (gameResult.basePoints || 0),
            totalDifficultyPoints: player.totalDifficultyPoints + (gameResult.difficultyPoints || 0),
            gamesPlayed: player.gamesPlayed + 1,
            gamesWon: player.gamesWon + (gameResult.completed ? 1 : 0),
            correctBrandGuesses: player.correctBrandGuesses + (gameResult.makeFound ? 1 : 0),
            correctModelGuesses: player.correctModelGuesses + (gameResult.modelFound ? 1 : 0),
            totalBrandGuesses: player.totalBrandGuesses + (gameResult.attemptsMake || 0),
            totalModelGuesses: player.totalModelGuesses + (gameResult.attemptsModel || 0)
        };

        // Gestion des streaks
        if (gameResult.completed) {
            newStats.currentStreak = player.currentStreak + 1;
            newStats.bestStreak = Math.max(player.bestStreak, newStats.currentStreak);
        } else {
            newStats.currentStreak = 0;
        }

        // Gestion du meilleur temps
        if (gameResult.duration && gameResult.completed) {
            if (!player.bestTime || gameResult.duration < player.bestTime) {
                newStats.bestTime = gameResult.duration;
            }
        }

        await this.updatePlayerStats(userId, newStats);
        return newStats;
    }
}

module.exports = PlayerRepository;
