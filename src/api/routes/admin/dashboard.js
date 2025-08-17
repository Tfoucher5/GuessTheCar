const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/dashboard - Statistiques du tableau de bord
 */
router.get('/', async(req, res) => {
    try {
        // Charger toutes les données en parallèle
        const [generalStats, recentGames, topPlayers, popularModels, gameStats] = await Promise.all([
            getGeneralStats(),
            getRecentGames(),
            getTopPlayers(),
            getPopularModels(),
            getGameStatistics()
        ]);

        res.json({
            success: true,
            data: {
                general: generalStats,
                recentGames: recentGames,
                topPlayers: topPlayers,
                popularModels: popularModels,
                gameStats: gameStats,
                lastUpdate: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement du tableau de bord'
        });
    }
});

/**
 * Statistiques générales
 */
async function getGeneralStats() {
    try {
        const results = await Promise.all([
            executeQuery('SELECT COUNT(*) as total FROM brands'),
            executeQuery('SELECT COUNT(*) as total FROM models'),
            executeQuery('SELECT COUNT(*) as total FROM user_scores'),
            executeQuery('SELECT COUNT(*) as total FROM game_sessions WHERE DATE(started_at) = CURDATE()'),
            executeQuery('SELECT AVG(total_points) as avg FROM user_scores WHERE total_points > 0'),
            executeQuery('SELECT COUNT(*) as total FROM game_sessions WHERE completed = 1'),
            executeQuery('SELECT COUNT(*) as total FROM game_sessions WHERE ended_at IS NULL')
        ]);

        return {
            totalBrands: results[0][0]?.total || 0,
            totalModels: results[1][0]?.total || 0,
            totalPlayers: results[2][0]?.total || 0,
            todayGames: results[3][0]?.total || 0,
            averageScore: Math.round(results[4][0]?.avg || 0),
            completedGames: results[5][0]?.total || 0,
            activeGames: results[6][0]?.total || 0
        };
    } catch (error) {
        logger.warn('Error in getGeneralStats:', error.message);
        return {
            totalBrands: 0,
            totalModels: 0,
            totalPlayers: 0,
            todayGames: 0,
            averageScore: 0,
            completedGames: 0,
            activeGames: 0
        };
    }
}

/**
 * Parties récentes (utilise votre structure game_sessions)
 */
async function getRecentGames() {
    try {
        const query = `
            SELECT 
                gs.id,
                gs.user_id,
                us.username,
                gs.started_at,
                gs.ended_at,
                gs.duration_seconds,
                gs.completed,
                gs.abandoned,
                gs.timeout,
                gs.make_found,
                gs.model_found,
                gs.attempts_make,
                gs.attempts_model,
                gs.points_earned,
                gs.difficulty_points_earned,
                CONCAT(b.name, ' ', m.name) as car_name,
                m.difficulty_level,
                CASE 
                    WHEN gs.ended_at IS NULL THEN 'En cours'
                    WHEN gs.completed = 1 THEN 'Terminée'
                    WHEN gs.abandoned = 1 THEN 'Abandonnée'
                    WHEN gs.timeout = 1 THEN 'Timeout'
                    ELSE 'Interrompue'
                END as status
            FROM game_sessions gs
            LEFT JOIN user_scores us ON gs.user_id = us.user_id
            LEFT JOIN models m ON gs.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
            WHERE gs.started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY gs.started_at DESC
            LIMIT 15
        `;

        return await executeQuery(query);
    } catch (error) {
        logger.warn('Error in getRecentGames:', error.message);
        return [];
    }
}

/**
 * Top joueurs (utilise vos colonnes exactes)
 */
async function getTopPlayers() {
    try {
        const query = `
            SELECT 
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
                average_response_time,
                ROUND((games_won / NULLIF(games_played, 0)) * 100, 1) as win_rate,
                ROUND((correct_brand_guesses / NULLIF(total_brand_guesses, 0)) * 100, 1) as brand_accuracy,
                ROUND((correct_model_guesses / NULLIF(total_model_guesses, 0)) * 100, 1) as model_accuracy,
                updated_at
            FROM user_scores
            WHERE total_points > 0
            ORDER BY total_difficulty_points DESC, total_points DESC
            LIMIT 10
        `;

        return await executeQuery(query);
    } catch (error) {
        logger.warn('Error in getTopPlayers:', error.message);
        return [];
    }
}

/**
 * Modèles populaires (basé sur game_sessions)
 */
async function getPopularModels() {
    try {
        const query = `
            SELECT 
                m.id,
                m.name,
                b.name as brand_name,
                m.difficulty_level,
                m.year,
                COUNT(gs.id) as play_count,
                SUM(CASE WHEN gs.completed = 1 THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN gs.make_found = 1 THEN 1 ELSE 0 END) as brand_found_count,
                SUM(CASE WHEN gs.model_found = 1 THEN 1 ELSE 0 END) as model_found_count,
                ROUND(AVG(gs.duration_seconds), 0) as avg_duration,
                ROUND(AVG(gs.points_earned), 1) as avg_points,
                ROUND((SUM(CASE WHEN gs.completed = 1 THEN 1 ELSE 0 END) / COUNT(gs.id)) * 100, 1) as success_rate
            FROM models m
            LEFT JOIN brands b ON m.brand_id = b.id
            LEFT JOIN game_sessions gs ON m.id = gs.car_id
            WHERE gs.started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY m.id, m.name, b.name, m.difficulty_level, m.year
            HAVING play_count > 0
            ORDER BY play_count DESC, success_rate DESC
            LIMIT 10
        `;

        return await executeQuery(query);
    } catch (error) {
        logger.warn('Error in getPopularModels:', error.message);
        return [];
    }
}

/**
 * Statistiques de jeu détaillées
 */
async function getGameStatistics() {
    try {
        const results = await Promise.all([
            // Répartition par difficulté
            executeQuery(`
                SELECT 
                    m.difficulty_level,
                    COUNT(gs.id) as total_games,
                    SUM(CASE WHEN gs.completed = 1 THEN 1 ELSE 0 END) as completed_games,
                    ROUND(AVG(gs.duration_seconds), 0) as avg_duration,
                    ROUND(AVG(gs.points_earned), 1) as avg_points
                FROM game_sessions gs
                LEFT JOIN models m ON gs.car_id = m.id
                WHERE gs.started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY m.difficulty_level
                ORDER BY m.difficulty_level
            `),

            // Statistiques globales des 30 derniers jours
            executeQuery(`
                SELECT 
                    DATE(started_at) as game_date,
                    COUNT(*) as daily_games,
                    SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as daily_completed,
                    ROUND(AVG(duration_seconds), 0) as avg_duration,
                    ROUND(SUM(points_earned), 1) as total_points
                FROM game_sessions
                WHERE started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(started_at)
                ORDER BY game_date DESC
                LIMIT 30
            `),

            // Top marques par popularité
            executeQuery(`
                SELECT 
                    b.name as brand_name,
                    b.country,
                    COUNT(gs.id) as games_played,
                    ROUND(AVG(gs.points_earned), 1) as avg_points,
                    ROUND((SUM(CASE WHEN gs.make_found = 1 THEN 1 ELSE 0 END) / COUNT(gs.id)) * 100, 1) as brand_recognition_rate
                FROM brands b
                LEFT JOIN models m ON b.id = m.brand_id
                LEFT JOIN game_sessions gs ON m.id = gs.car_id
                WHERE gs.started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY b.id, b.name, b.country
                HAVING games_played > 0
                ORDER BY games_played DESC
                LIMIT 10
            `)
        ]);

        return {
            difficultyStats: results[0],
            dailyStats: results[1],
            topBrands: results[2]
        };
    } catch (error) {
        logger.warn('Error in getGameStatistics:', error.message);
        return {
            difficultyStats: [],
            dailyStats: [],
            topBrands: []
        };
    }
}

/**
 * Endpoint pour les statistiques en temps réel
 */
router.get('/realtime', async(req, res) => {
    try {
        const stats = await executeQuery(`
            SELECT 
                COUNT(CASE WHEN ended_at IS NULL THEN 1 END) as active_games,
                COUNT(CASE WHEN DATE(started_at) = CURDATE() THEN 1 END) as today_games,
                COUNT(CASE WHEN started_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) as last_hour_games,
                AVG(CASE WHEN completed = 1 THEN duration_seconds END) as avg_completion_time
            FROM game_sessions
        `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        logger.error('Error fetching realtime stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des statistiques temps réel'
        });
    }
});

module.exports = router;
