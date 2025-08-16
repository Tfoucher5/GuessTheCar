const express = require('express');
const router = express.Router();
const logger = require('../../../shared/utils/logger');

// Middleware d'authentification admin
const requireAdmin = (req, res, next) => {
    next();
};

router.use(requireAdmin);

// Routes essentielles seulement
router.use('/dashboard', require('./dashboard'));
router.use('/models', require('./models'));

// Catch-all pour les routes non implémentées
router.use('*', (req, res) => {
    res.json({
        success: true,
        message: 'Endpoint en cours de développement',
        path: req.originalUrl
    });
});

module.exports = router;
