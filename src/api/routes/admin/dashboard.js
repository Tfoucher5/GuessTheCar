const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/dashboard
 * Données complètes du dashboard admin
 */
router.get('/', async(req, res) => {
    try {
        // Récupérer toutes les statistiques en parallèle
        const [
            brandsStats,
            modelsStats,
            playersStats,
            gamesStats,
            topPlayers,
            recentActivity,
            difficultyBreakdown,
            popularBrands
        ] = await Promise.all([
            getBrandsStats(),
            getModelsStats(),
            getPlayersStats(),
            getGamesStats(),
            getTopPlayers(10),
            getRecentActivity(20),
            getDifficultyBreakdown(),
            getPopularBrands(10)
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalBrands: brandsStats.total,
                    totalModels: modelsStats.total,
                    totalPlayers: playersStats.total,
                    totalGames: gamesStats.total,
                    brandsChange: brandsStats.change,
                    modelsChange: modelsStats.change,
                    playersChange: playersStats.change,
                    gamesChange: gamesStats.change,
                    difficultyBreakdown,
                    popularBrands
                },
                topPlayers,
                recentActivity,
                systemInfo: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    nodeVersion: process.version,
                    platform: process.platform
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error('Error fetching admin dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement du dashboard'
        });
    }
});

// Fonctions utilitaires
async function getBrandsStats() {
    const [current] = await executeQuery('SELECT COUNT(*) as total FROM brands');
    const [lastWeek] = await executeQuery(`
        SELECT COUNT(*) as total 
        FROM brands 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const change = lastWeek.total > 0 ?
        Math.round(((current.total - lastWeek.total) / lastWeek.total) * 100) : 0;

    return { total: current.total, change };
}

async function getModelsStats() {
    const [current] = await executeQuery('SELECT COUNT(*) as total FROM models');
    const [lastWeek] = await executeQuery(`
        SELECT COUNT(*) as total 
        FROM models 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const change = lastWeek.total > 0 ?
        Math.round(((current.total - lastWeek.total) / lastWeek.total) * 100) : 0;

    return { total: current.total, change };
}

async function getPlayersStats() {
    const [current] = await executeQuery('SELECT COUNT(*) as total FROM user_scores');
    const [lastWeek] = await executeQuery(`
        SELECT COUNT(*) as total 
        FROM user_scores 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const change = lastWeek.total > 0 ?
        Math.round(((current.total - lastWeek.total) / lastWeek.total) * 100) : 0;

    return { total: current.total, change };
}

async function getGamesStats() {
    const [current] = await executeQuery('SELECT COUNT(*) as total FROM game_sessions');
    const [lastWeek] = await executeQuery(`
        SELECT COUNT(*) as total 
        FROM game_sessions 
        WHERE started_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const change = lastWeek.total > 0 ?
        Math.round(((current.total - lastWeek.total) / lastWeek.total) * 100) : 0;

    return { total: current.total, change };
}

async function getTopPlayers(limit = 10) {
    return await executeQuery(`
        SELECT 
            user_id,
            username,
            total_points,
            games_played,
            games_won,
            CASE 
                WHEN games_played > 0 
                THEN ROUND((games_won / games_played) * 100, 1)
                ELSE 0 
            END as win_rate
        FROM user_scores
        ORDER BY total_points DESC
        LIMIT ?
    `, [limit]);
}

async function getRecentActivity(limit = 20) {
    return await executeQuery(`
        SELECT 
            'game_completed' as type,
            CONCAT(u.username, ' a terminé une partie avec ', b.name, ' ', m.name) as description,
            g.ended_at as created_at,
            g.points_earned,
            g.duration_seconds
        FROM game_sessions g
        JOIN user_scores u ON g.user_id = u.user_id
        JOIN models m ON g.car_id = m.id
        JOIN brands b ON m.brand_id = b.id
        WHERE g.completed = 1 AND g.ended_at IS NOT NULL
        ORDER BY g.ended_at DESC
        LIMIT ?
    `, [limit]);
}

async function getDifficultyBreakdown() {
    const results = await executeQuery(`
        SELECT 
            difficulty_level,
            COUNT(*) as count
        FROM models
        GROUP BY difficulty_level
        ORDER BY difficulty_level
    `);

    const breakdown = {};
    results.forEach(row => {
        breakdown[row.difficulty_level] = row.count;
    });

    return breakdown;
}

async function getPopularBrands(limit = 10) {
    return await executeQuery(`
        SELECT 
            b.name,
            COUNT(m.id) as count
        FROM brands b
        LEFT JOIN models m ON b.id = m.brand_id
        GROUP BY b.id, b.name
        HAVING count > 0
        ORDER BY count DESC
        LIMIT ?
    `, [limit]);
}

module.exports = router;
