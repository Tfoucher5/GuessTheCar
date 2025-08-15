const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../../shared/utils/logger');

// Rate limiter global
const rateLimiter = new RateLimiterMemory({
    keyStoragePrefix: 'api_global',
    points: 100, // Nombre de requêtes
    duration: 60, // Par minute
    blockDuration: 60 // Bloquer pendant 1 minute
});

// Rate limiter strict pour certaines routes
const strictRateLimiter = new RateLimiterMemory({
    keyStoragePrefix: 'api_strict',
    points: 10, // Moins de requêtes
    duration: 60,
    blockDuration: 300 // Bloquer pendant 5 minutes
});

/**
 * Middleware de rate limiting
 */
const rateLimitMiddleware = async(req, res, next) => {
    try {
        const key = req.ip;

        // Utiliser le rate limiter strict pour certaines routes
        const limiter = req.path.includes('/random') ? strictRateLimiter : rateLimiter;

        await limiter.consume(key);
        next();
    } catch (rejRes) {
        const remainingTime = Math.round(rejRes.msBeforeNext) || 1000;

        logger.warn('Rate limit exceeded:', {
            ip: req.ip,
            path: req.path,
            remainingTime
        });

        res.set('Retry-After', Math.round(remainingTime / 1000) || 1);
        res.status(429).json({
            success: false,
            error: 'Too Many Requests',
            message: 'Trop de requêtes. Réessayez plus tard.',
            retryAfter: remainingTime
        });
    }
};

module.exports = rateLimitMiddleware;
