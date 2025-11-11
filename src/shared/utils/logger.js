const winston = require('winston');
const path = require('path');

// Configuration des formats
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Configuration du logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'guess-the-car-bot' },
    transports: [
        // Console pour le développement
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),

        // Fichier pour toutes les erreurs
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        // Fichier pour tous les logs
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

module.exports = logger;
