const express = require('express');
const { getPool } = require('../../shared/database/connection');
const CarService = require('../../core/car/CarService');

const router = express.Router();
const carService = new CarService();

/**
 * GET /api/health
 * Check de santé basique
 */
router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * GET /api/health/detailed
 * Check de santé détaillé
 */
router.get('/detailed', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {}
    };

    // Test de la base de données
    try {
        const pool = getPool();
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        health.checks.database = {
            status: 'healthy',
            message: 'Database connection successful'
        };
    } catch (error) {
        health.status = 'unhealthy';
        health.checks.database = {
            status: 'unhealthy',
            message: error.message
        };
    }

    // Test du service de voitures
    try {
        await carService.getCarStats();
        health.checks.carService = {
            status: 'healthy',
            message: 'Car service operational'
        };
    } catch (error) {
        health.status = 'unhealthy';
        health.checks.carService = {
            status: 'unhealthy',
            message: error.message
        };
    }

    // Test de la mémoire
    const memUsage = process.memoryUsage();
    const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
    };

    health.checks.memory = {
        status: memUsageMB.heapUsed < 500 ? 'healthy' : 'warning',
        usage: memUsageMB,
        message: `Heap used: ${memUsageMB.heapUsed}MB`
    };

    // Statut HTTP selon la santé globale
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

/**
 * GET /api/health/database
 * Check spécifique de la base de données
 */
router.get('/database', async (req, res) => {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();

        // Test de connexion
        await connection.ping();

        // Test de requête simple
        const [results] = await connection.execute('SELECT COUNT(*) as count FROM marques');
        const makeCount = results[0].count;

        const [results2] = await connection.execute('SELECT COUNT(*) as count FROM modeles');
        const modelCount = results2[0].count;

        connection.release();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                makesCount: makeCount,
                modelsCount: modelCount,
                message: 'Database is operational'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: false,
                error: error.message,
                message: 'Database connection failed'
            }
        });
    }
});

/**
 * GET /api/health/ready
 * Check de préparation (readiness probe)
 */
router.get('/ready', async (req, res) => {
    try {
        // Vérifier que tous les services critiques sont prêts
        const pool = getPool();
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        // Vérifier qu'il y a des données
        const stats = await carService.getCarStats();
        if (stats.totalCars === 0) {
            throw new Error('No cars in database');
        }

        res.json({
            status: 'ready',
            timestamp: new Date().toISOString(),
            message: 'Application is ready to serve traffic'
        });
    } catch (error) {
        res.status(503).json({
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            error: error.message,
            message: 'Application is not ready'
        });
    }
});

/**
 * GET /api/health/live
 * Check de vivacité (liveness probe)
 */
router.get('/live', (req, res) => {
    res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Application is alive'
    });
});

module.exports = router;