const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const logger = require('../shared/utils/logger');
const { AppError } = require('../shared/errors');

const app = express();

// Middleware de sécurité
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour l'admin avec CDN
    crossOriginEmbedderPolicy: false
}));

// Compression gzip
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
        : true,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Parsing JSON avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});

// 🆕 SERVIR L'INTERFACE D'ADMINISTRATION
// Servir les fichiers statiques de l'admin
app.use('/admin', express.static(path.join(__dirname, '../admin/public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : '0',
    etag: true,
    lastModified: true
}));

// Route SPA fallback pour l'admin
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/public/index.html'));
});

// 🆕 ROUTES API D'ADMINISTRATION
app.use('/api/admin', require('./routes/admin'));

// Routes API existantes
app.use('/api/health', require('./routes/health'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/players', require('./routes/players'));
app.use('/api/games', require('./routes/games'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Route par défaut - rediriger vers l'admin
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// API Info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Guess The Car Bot API',
        version: '2.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            admin: '/api/admin',
            documentation: '/api/docs'
        }
    });
});

// Documentation API simple
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'Guess The Car Bot API Documentation',
        version: '2.0.0',
        endpoints: {
            // Public endpoints
            health: {
                path: '/api/health',
                methods: ['GET'],
                description: 'Vérification de l\'état du serveur'
            },
            stats: {
                path: '/api/stats',
                methods: ['GET'],
                description: 'Statistiques publiques'
            },
            leaderboard: {
                path: '/api/leaderboard',
                methods: ['GET'],
                description: 'Classement des joueurs'
            },

            // Admin endpoints
            adminDashboard: {
                path: '/api/admin/dashboard',
                methods: ['GET'],
                description: 'Données du dashboard administrateur'
            },
            adminBrands: {
                path: '/api/admin/brands',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Gestion des marques'
            },
            adminModels: {
                path: '/api/admin/models',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Gestion des modèles'
            },
            adminPlayers: {
                path: '/api/admin/players',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Gestion des joueurs'
            },
            adminGames: {
                path: '/api/admin/games',
                methods: ['GET', 'DELETE'],
                description: 'Consultation et suppression des parties'
            }
        }
    });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} non trouvée`, 404);
    next(error);
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
    let err = { ...error };
    err.message = error.message;

    // Log de l'erreur
    logger.error('API Error:', {
        error: err.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        timestamp: new Date().toISOString()
    });

    // Erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map(val => val.message).join(', ');
        err = new AppError(message, 400);
    }

    // Erreurs de cast Mongoose
    if (error.name === 'CastError') {
        const message = 'Ressource non trouvée';
        err = new AppError(message, 404);
    }

    // Erreurs de clé dupliquée
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message = `${field} existe déjà`;
        err = new AppError(message, 400);
    }

    // Erreurs JWT
    if (error.name === 'JsonWebTokenError') {
        const message = 'Token invalide';
        err = new AppError(message, 401);
    }

    if (error.name === 'TokenExpiredError') {
        const message = 'Token expiré';
        err = new AppError(message, 401);
    }

    // Erreurs MySQL spécifiques
    if (error.code === 'ER_NO_SUCH_TABLE') {
        err = new AppError('Table de base de données non trouvée', 500);
    }

    if (error.code === 'ECONNREFUSED') {
        err = new AppError('Service de base de données indisponible', 503);
    }

    if (error.code === 'ER_DUP_ENTRY') {
        err = new AppError('Entrée dupliquée', 400);
    }

    // Erreurs de limite de taille
    if (error.type === 'entity.too.large') {
        err = new AppError('Fichier trop volumineux', 413);
    }

    // Réponse d'erreur
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erreur serveur interne';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                original: error
            })
        },
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
