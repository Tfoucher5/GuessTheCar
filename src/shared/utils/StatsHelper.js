// src/shared/utils/StatsHelper.js
const axios = require('axios');
const logger = require('./logger');

class StatsHelper {
    constructor() {
        this.apiUrl = process.env.STATS_API_URL || 'http://localhost:3000/api';
        this.enabled = process.env.STATS_ENABLED !== 'false';
        this.timeout = parseInt(process.env.STATS_TIMEOUT) || 2000;

        this.client = axios.create({
            baseURL: this.apiUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'GuessTheCar-Bot/1.0'
            }
        });

        logger.info('StatsHelper initialized:', {
            apiUrl: this.apiUrl,
            enabled: this.enabled
        });
    }

    async logCommand(commandName, userId) {
        if (!this.enabled) return;

        try {
            const response = await this.client.post('/bot/command', {
                command: commandName,
                user: userId,
                timestamp: new Date().toISOString()
            });

            logger.debug('Command logged:', {
                command: commandName,
                user: userId
            });

            return response.data;
        } catch (error) {
            logger.warn('Failed to log command:', {
                command: commandName,
                error: error.message
            });
        }
    }

    // Dans StatsHelper.js, modifiez logGame() :
    async logGame(action, channelId, userId = null) {
        if (!this.enabled) return;

        try {
            const payload = {
                action,
                channelId,
                user: userId,
                sessionId: `${channelId}_${userId}`,
                timestamp: new Date().toISOString()
            };

            const response = await this.client.post('/bot/game', payload);

            console.log(`✅ Game ${action} logged, active games:`, response.data?.games?.active);

            return response.data;
        } catch (error) {
            console.error('❌ Failed to log game ${action}:', error.message);
            console.error('🔍 DEBUG - Error details:', error.response?.data); // ✅ Et ça aussi
        }
    }

    async testConnection() {
        if (!this.enabled) {
            return { success: false, reason: 'Stats disabled' };
        }

        try {
            const response = await this.client.get('/health');

            logger.info('Stats API connection test successful:', {
                status: response.data?.status
            });

            return { success: true, data: response.data };
        } catch (error) {
            logger.warn('Stats API connection test failed:', {
                error: error.message,
                url: this.apiUrl
            });

            return { success: false, error: error.message };
        }
    }

    async getStats() {
        if (!this.enabled) return null;

        try {
            const response = await this.client.get('/bot/stats');

            logger.debug('Stats retrieved from API:', response.data);

            return response.data;
        } catch (error) {
            logger.warn('Failed to get stats from API:', {
                error: error.message
            });
            return null;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        logger.info('Stats tracking:', { enabled });
    }
}

const statsHelper = new StatsHelper();
module.exports = statsHelper;
