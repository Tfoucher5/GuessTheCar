// src/api/routes/admin/index.js
const express = require('express');
const router = express.Router();
const logger = require('../../../shared/utils/logger');

// Middleware d'authentification admin
const requireAdmin = (req, res, next) => {
    // Pour l'instant, pas d'auth - peut être ajouté plus tard
    next();
};

router.use(requireAdmin);

// Routes essentielles
router.use('/dashboard', require('./dashboard'));
router.use('/models', require('./models'));
router.use('/brands', require('./brands'));
router.use('/players', require('./players'));
router.use('/games', require('./games'));
router.use('/system', require('./system'));

// Routes additionnelles (en développement)
router.use('/backup', require('./backup'));
router.use('/logs', require('./logs'));
router.use('/settings', require('./settings'));

// Catch-all pour les routes non implémentées
router.use('*', (req, res) => {
    res.json({
        success: true,
        message: 'Endpoint en cours de développement',
        path: req.originalUrl,
        method: req.method
    });
});

module.exports = router;


