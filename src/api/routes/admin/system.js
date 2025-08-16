// src/api/routes/admin/system.js
const express = require('express');
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

/**
 * GET /api/admin/system/info - Informations système
 */
router.get('/info', async(req, res) => {
    try {
        const systemInfo = {
            server: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                env: process.env.NODE_ENV || 'development'
            },
            database: {
                connected: true,
                host: process.env.DB_HOST || 'localhost',
                name: process.env.DB_NAME || 'guessthecar'
            },
            application: {
                name: 'Guess The Car Bot',
                version: '2.0.0',
                started: new Date().toISOString()
            }
        };

        res.json({
            success: true,
            data: systemInfo
        });
    } catch (error) {
        logger.error('Error fetching system info:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des informations système'
        });
    }
});

/**
 * GET /api/admin/system/stats - Statistiques de base de données
 */
router.get('/stats', async(req, res) => {
    try {
        const [brandsCount] = await executeQuery('SELECT COUNT(*) as count FROM brands');
        const [modelsCount] = await executeQuery('SELECT COUNT(*) as count FROM models');
        const [playersCount] = await executeQuery('SELECT COUNT(*) as count FROM user_scores');
        const [gamesCount] = await executeQuery('SELECT COUNT(*) as count FROM game_sessions');

        const stats = {
            brands: brandsCount.count,
            models: modelsCount.count,
            players: playersCount.count,
            games: gamesCount.count
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching database stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des statistiques'
        });
    }
});

module.exports = router;
