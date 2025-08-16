const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * GET /api/admin/system/info - Informations système
 */
router.get('/info', async(req, res) => {
    try {
        const systemInfo = await getSystemInfo();
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
 * GET /api/admin/system/database - Informations base de données
 */
router.get('/database', async(req, res) => {
    try {
        const dbInfo = await getDatabaseInfo();
        res.json({
            success: true,
            data: dbInfo
        });
    } catch (error) {
        logger.error('Error fetching database info:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des informations de base de données'
        });
    }
});

/**
 * POST /api/admin/system/clear-cache - Vider le cache
 */
router.post('/clear-cache', async(req, res) => {
    try {
        // Ici vous pouvez ajouter la logique pour vider le cache
        // Par exemple, si vous utilisez Redis ou un cache en mémoire

        res.json({
            success: true,
            message: 'Cache vidé avec succès'
        });
    } catch (error) {
        logger.error('Error clearing cache:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du vidage du cache'
        });
    }
});

/**
 * GET /api/admin/system/logs - Récupérer les logs récents
 */
router.get('/logs', async(req, res) => {
    try {
        const { type = 'combined', lines = 50 } = req.query;
        const logs = await getRecentLogs(type, parseInt(lines));

        res.json({
            success: true,
            data: {
                type,
                lines: logs.length,
                logs
            }
        });
    } catch (error) {
        logger.error('Error fetching logs:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des logs'
        });
    }
});

/**
 * GET /api/admin/system/health - Health check détaillé
 */
router.get('/health', async(req, res) => {
    try {
        const health = await getDetailedHealth();
        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        logger.error('Error checking health:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification de l\'état du système'
        });
    }
});

async function getSystemInfo() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
        server: {
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            uptime: {
                seconds: Math.floor(uptime),
                human: formatUptime(uptime)
            }
        },
        memory: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 3000,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    };
}

async function getDatabaseInfo() {
    try {
        // Informations sur les tables
        const tables = await executeQuery('SHOW TABLE STATUS');

        // Taille totale de la base
        const [dbSize] = await executeQuery(`
            SELECT 
                ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS total_size_mb
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        `);

        // Statistiques par table
        const tableStats = tables.map(table => ({
            name: table.Name,
            engine: table.Engine,
            rows: table.Rows,
            sizeMB: Math.round((table.Data_length + table.Index_length) / 1024 / 1024 * 100) / 100,
            created: table.Create_time,
            updated: table.Update_time
        }));

        // Test de connexion
        const [connectionTest] = await executeQuery('SELECT 1 as test');

        return {
            status: connectionTest.test === 1 ? 'connected' : 'error',
            totalSizeMB: dbSize.total_size_mb || 0,
            tables: tableStats,
            version: await getDatabaseVersion()
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message
        };
    }
}

async function getDatabaseVersion() {
    try {
        const [result] = await executeQuery('SELECT VERSION() as version');
        return result.version;
    } catch (error) {
        return 'unknown';
    }
}

async function getRecentLogs(type, lines) {
    try {
        const logFile = path.join(__dirname, '../../../../logs', `${type}.log`);
        const content = await fs.readFile(logFile, 'utf8');

        const logLines = content.split('\n')
            .filter(line => line.trim())
            .slice(-lines)
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return { message: line, timestamp: new Date().toISOString() };
                }
            });

        return logLines;
    } catch (error) {
        logger.warn(`Could not read log file: ${error.message}`);
        return [];
    }
}

async function getDetailedHealth() {
    const health = {
        status: 'healthy',
        checks: {},
        timestamp: new Date().toISOString()
    };

    // Test de base de données
    try {
        await executeQuery('SELECT 1');
        health.checks.database = { status: 'healthy', message: 'Database connection OK' };
    } catch (error) {
        health.status = 'unhealthy';
        health.checks.database = { status: 'unhealthy', message: error.message };
    }

    // Test de mémoire
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > 90) {
        health.status = 'warning';
        health.checks.memory = {
            status: 'warning',
            message: `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
            usage: memoryUsagePercent
        };
    } else {
        health.checks.memory = {
            status: 'healthy',
            message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
            usage: memoryUsagePercent
        };
    }

    // Test de disponibilité des fichiers de log
    try {
        const logDir = path.join(__dirname, '../../../../logs');
        await fs.access(logDir);
        health.checks.logging = { status: 'healthy', message: 'Log directory accessible' };
    } catch (error) {
        health.checks.logging = { status: 'warning', message: 'Log directory not accessible' };
    }

    return health;
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
        return `${days}j ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

module.exports = router;
