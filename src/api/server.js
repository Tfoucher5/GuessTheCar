const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const logger = require('../shared/utils/logger');
const { AppError } = require('../shared/errors');

// Routes
const carsRoutes = require('./routes/cars');
const healthRoutes = require('./routes/health');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimit');

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Logging des requêtes
app.use((req, res, next) => {
    logger.info('API Request:', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/cars', carsRoutes);

// Route par défaut
app.get('/', (req, res) => {
    res.json({
        name: 'Guess The Car Bot API',
        version: '2.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            cars: '/api/cars'
        }
    });
});

// Gestion des routes non trouvées
app.all('*', (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} non trouvée`, 404));
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

module.exports = app;