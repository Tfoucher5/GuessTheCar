const express = require('express');
const router = express.Router();
const os = require('os');
const logger = require('../../../shared/utils/logger');

router.get('/', async(req, res) => {
    try {
        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            uptime: os.uptime(),
            loadavg: os.loadavg(),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            },
            cpu: os.cpus()[0]
        };

        res.json({
            success: true,
            data: systemInfo
        });
    } catch (error) {
        logger.error('Error getting system info:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des informations système'
        });
    }
});

module.exports = router;
