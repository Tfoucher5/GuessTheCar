// src/api/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Utilities
const logger = require('../shared/utils/logger');
const { AppError } = require('../shared/errors');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['\'self\''],
            styleSrc: ['\'self\'', '\'unsafe-inline\''],
            scriptSrc: ['\'self\'', '\'unsafe-inline\''],
            imgSrc: ['\'self\'', 'data:', 'https:'],
            connectSrc: ['\'self\''],
            fontSrc: ['\'self\''],
            objectSrc: ['\'none\''],
            mediaSrc: ['\'self\''],
            frameSrc: ['\'none\'']
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || false
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: process.env.NODE_ENV === 'production' ? 100 : 1000, // Nombre de requêtes
    duration: 15 * 60 // 15 minutes en secondes
});

// Middleware pour appliquer le rate limiting
const rateLimiterMiddleware = async(req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).json({
            success: false,
            error: 'Trop de requêtes, veuillez réessayer plus tard.',
            retryAfter: secs
        });
    }
};

app.use('/api/', rateLimiterMiddleware);

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

// Routes API publiques uniquement
app.use('/api/bot', require('./routes/bot'));
app.use('/api/health', require('./routes/health'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Route par défaut - message simple
app.get('/', (req, res) => {
    res.json({
        message: 'Guess The Car Bot API',
        version: '2.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
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
            stats: '/api/stats',
            cars: '/api/cars',
            leaderboard: '/api/leaderboard',
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
            cars: {
                path: '/api/cars',
                methods: ['GET'],
                description: 'Informations sur les voitures'
            },
            leaderboard: {
                path: '/api/leaderboard',
                methods: ['GET'],
                description: 'Classement des joueurs'
            }
        }
    });
});

// Middleware de gestion d'erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée',
        path: req.originalUrl
    });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }

    res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && {
            message: error.message,
            stack: error.stack
        })
    });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.API_PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}
