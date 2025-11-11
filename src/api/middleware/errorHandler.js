const logger = require('../../shared/utils/logger');
const { AppError, DatabaseError, ValidationError, NotFoundError } = require('../../shared/errors');

/**
 * Middleware de gestion d'erreurs pour l'API
 */
const errorHandler = (error, req, res) => {
    let err = { ...error };
    err.message = error.message;

    // Log de l'erreur
    logger.error('API Error:', {
        error: err.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Erreurs de validation
    if (error instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erreurs de ressource non trouvée
    if (error instanceof NotFoundError) {
        return res.status(404).json({
            success: false,
            error: 'Not Found',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erreurs de base de données
    if (error instanceof DatabaseError) {
        return res.status(500).json({
            success: false,
            error: 'Database Error',
            message: 'Une erreur de base de données est survenue',
            timestamp: new Date().toISOString()
        });
    }

    // Erreurs MySQL spécifiques
    if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
            success: false,
            error: 'Database Error',
            message: 'Table de base de données non trouvée',
            timestamp: new Date().toISOString()
        });
    }

    if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            error: 'Service Unavailable',
            message: 'Service de base de données indisponible',
            timestamp: new Date().toISOString()
        });
    }

    // Erreurs JSON malformé
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'JSON malformé',
            timestamp: new Date().toISOString()
        });
    }

    // Erreurs d'application personnalisées
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.name,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erreur par défaut
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Une erreur interne est survenue'
            : error.message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
};

module.exports = errorHandler;
