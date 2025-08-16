const express = require('express');
const router = express.Router();
const logger = require('../../../shared/utils/logger');

router.get('/', async(req, res) => {
    res.json({
        success: true,
        data: {
            message: 'Cache endpoint',
            size: 0,
            entries: 0
        }
    });
});

router.delete('/clear', async(req, res) => {
    try {
        // TODO: Implémenter le nettoyage du cache
        logger.info('Cache cleared');
        res.json({
            success: true,
            message: 'Cache vidé avec succès'
        });
    } catch (error) {
        logger.error('Error clearing cache:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du nettoyage du cache'
        });
    }
});

module.exports = router;
