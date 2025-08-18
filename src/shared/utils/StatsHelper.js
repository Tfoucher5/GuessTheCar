// Correction du StatsHelper.js pour résoudre l'erreur 404
// Remplacez votre StatsHelper.js par ce code :

const axios = require('axios');
const logger = require('./logger');

class StatsHelper {
    constructor() {
        // Configuration d'URL corrigée
        this.apiUrl = process.env.STATS_API_URL || 'http://localhost:3001/api';
        this.enabled = process.env.STATS_ENABLED !== 'false';
        this.timeout = parseInt(process.env.STATS_TIMEOUT) || 3000;

        this.client = axios.create({
            baseURL: this.apiUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'GuessTheCar-Bot/2.0'
            }
        });

        // Intercepteur pour logger les requêtes en cas d'erreur
        this.client.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 404) {
                    logger.warn('StatsHelper API endpoint not found:', {
                        url: error.config?.url,
                        method: error.config?.method,
                        baseURL: error.config?.baseURL
                    });
                }
                return Promise.reject(error);
            }
        );

        logger.info('StatsHelper initialized:', {
            apiUrl: this.apiUrl,
            enabled: this.enabled,
            timeout: this.timeout
        });
    }

    async logCommand(commandName, userId, additionalData = {}) {
        if (!this.enabled) return { success: false, reason: 'disabled' };

        try {
            const payload = {
                command: commandName,
                user: userId,
                timestamp: new Date().toISOString(),
                ...additionalData
            };

            const response = await this.client.post('/bot/command', payload);

            logger.debug('Command logged:', {
                command: commandName,
                user: userId,
                status: response.status
            });

            return { success: true, data: response.data };
        } catch (error) {
            logger.warn('Failed to log command:', {
                command: commandName,
                userId,
                error: error.message,
                status: error.response?.status
            });
            return { success: false, error: error.message };
        }
    }

    async logGame(action, channelId, userId = null, additionalData = {}) {
        if (!this.enabled) return { success: false, reason: 'disabled' };

        try {
            // Construction du payload avec données optionnelles
            const payload = {
                action: action.toLowerCase(),
                channelId,
                timestamp: new Date().toISOString(),
                ...additionalData
            };

            // Ajouter l'utilisateur si fourni
            if (userId) {
                payload.user = userId;
            }

            // Générer un sessionId plus robuste
            if (channelId && userId) {
                payload.sessionId = `${channelId}_${userId}_${Date.now()}`;
            }

            logger.debug('Logging game action:', {
                action,
                channelId,
                userId,
                payload
            });

            const response = await this.client.post('/bot/game', payload);

            logger.debug('Game action logged:', {
                action,
                channelId,
                userId,
                status: response.status,
                activeGames: response.data?.games?.active
            });

            return { success: true, data: response.data };
        } catch (error) {
            logger.warn('Failed to log game action:', {
                action,
                channelId,
                userId,
                error: error.message,
                status: error.response?.status,
                url: error.config?.url
            });
            return { success: false, error: error.message };
        }
    }

    async logError(error, context = {}) {
        if (!this.enabled) return { success: false, reason: 'disabled' };

        try {
            const payload = {
                message: error.message || error,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                type: 'bot_error',
                context
            };

            const response = await this.client.post('/bot/error', payload);

            logger.debug('Error logged to stats API');

            return { success: true, data: response.data };
        } catch (apiError) {
            logger.warn('Failed to log error to stats API:', {
                originalError: error.message,
                apiError: apiError.message
            });
            return { success: false, error: apiError.message };
        }
    }

    async testConnection() {
        if (!this.enabled) {
            return { success: false, reason: 'Stats disabled' };
        }

        try {
            // Tester d'abord /health, puis /test si ça échoue
            let response;
            try {
                response = await this.client.get('/health');
            } catch (healthError) {
                logger.debug('Health endpoint failed, trying /test:', healthError.message);
                response = await this.client.get('/test');
            }

            logger.info('Stats API connection test successful:', {
                status: response.data?.status || 'ok',
                endpoint: response.config.url
            });

            return { success: true, data: response.data };
        } catch (error) {
            logger.warn('Stats API connection test failed:', {
                error: error.message,
                status: error.response?.status,
                url: error.config?.url || this.apiUrl
            });

            return { success: false, error: error.message };
        }
    }

    async getStats() {
        if (!this.enabled) return null;

        try {
            const response = await this.client.get('/stats');
            return response.data;
        } catch (error) {
            logger.warn('Failed to get stats:', {
                error: error.message,
                status: error.response?.status
            });
            return null;
        }
    }

    async resetStats(type = 'all') {
        if (!this.enabled) return { success: false, reason: 'disabled' };

        try {
            const response = await this.client.post('/reset', { type });

            logger.info('Stats reset:', { type, success: true });

            return { success: true, data: response.data };
        } catch (error) {
            logger.warn('Failed to reset stats:', {
                type,
                error: error.message,
                status: error.response?.status
            });
            return { success: false, error: error.message };
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        logger.info('Stats tracking:', { enabled });
    }

    // Méthode utilitaire pour vérifier si l'API est disponible
    async isAPIAvailable() {
        try {
            const result = await this.testConnection();
            return result.success;
        } catch (error) {
            return false;
        }
    }

    // Méthode pour obtenir la configuration actuelle
    getConfig() {
        return {
            apiUrl: this.apiUrl,
            enabled: this.enabled,
            timeout: this.timeout
        };
    }
}

// Export singleton
const statsHelper = new StatsHelper();
module.exports = statsHelper;
