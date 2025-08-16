const express = require('express');
const router = express.Router();
const logger = require('../../../shared/utils/logger');

// Middleware d'authentification admin (simple pour le développement)
const requireAdmin = (req, res, next) => {
    // TODO: Implémenter votre logique d'authentification
    // Pour le développement, on autorise tout le monde
    next();
};

// Middleware de validation des paramètres de pagination
const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;

    if (page && (isNaN(page) || parseInt(page) < 1)) {
        return res.status(400).json({
            success: false,
            error: 'Le paramètre page doit être un nombre entier positif'
        });
    }

    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 1000)) {
        return res.status(400).json({
            success: false,
            error: 'Le paramètre limit doit être un nombre entre 1 et 1000'
        });
    }

    next();
};

// Appliquer le middleware d'auth sur toutes les routes
router.use(requireAdmin);

// Routes principales
router.use('/dashboard', require('./dashboard'));
router.use('/brands', validatePagination, require('./brands'));
router.use('/models', validatePagination, require('./models'));
router.use('/players', validatePagination, require('./players'));
router.use('/games', validatePagination, require('./games'));
router.use('/analytics', require('./analytics'));
router.use('/maintenance', require('./maintenance'));
router.use('/export', require('./export'));
router.use('/import', require('./import'));
router.use('/logs', require('./logs'));
router.use('/system', require('./system'));
router.use('/config', require('./config'));
router.use('/backups', require('./backups'));
router.use('/notifications', require('./notifications'));
router.use('/cache', require('./cache'));

// Middleware de logging pour l'audit
router.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
        if (['POST', 'PUT', 'DELETE'].includes(req.method) && res.statusCode < 400) {
            logger.info('Admin action performed', {
                method: req.method,
                path: req.path,
                user: req.user?.username || 'anonymous',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                body: req.method !== 'DELETE' ? req.body : undefined,
                timestamp: new Date().toISOString(),
                success: res.statusCode < 400
            });
        }
        return originalSend.call(this, data);
    };
    next();
});

// Gestion d'erreurs spécialisée
router.use((error, req, res, next) => {
    logger.error('Admin route error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        user: req.user?.username || 'anonymous',
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    let statusCode = error.statusCode || 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = error.message || 'Erreur interne du serveur';

    // Gestion spécifique des erreurs MySQL
    if (error.code) {
        switch (error.code) {
        case 'ER_NO_SUCH_TABLE':
            statusCode = 500;
            errorCode = 'DATABASE_TABLE_NOT_FOUND';
            message = 'Table de base de données introuvable';
            break;
        case 'ER_DUP_ENTRY':
            statusCode = 409;
            errorCode = 'DUPLICATE_ENTRY';
            message = 'Cette entrée existe déjà';
            break;
        case 'ER_NO_REFERENCED_ROW_2':
            statusCode = 400;
            errorCode = 'FOREIGN_KEY_CONSTRAINT';
            message = 'Référence invalide vers un autre enregistrement';
            break;
        }
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: errorCode
        },
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// Route catch-all
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Endpoint administratif non trouvé: ${req.method} ${req.baseUrl}${req.path}`,
            code: 'ADMIN_ENDPOINT_NOT_FOUND'
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
