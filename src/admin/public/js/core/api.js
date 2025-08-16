/* eslint-disable no-undef */
/**
 * Module de gestion des appels API
 */

class APIManager {
    constructor() {
        this.baseURL = window.Config.API.BASE_URL;
        this.timeout = window.Config.API.TIMEOUT;
        this.retryAttempts = window.Config.API.RETRY_ATTEMPTS;
        this.retryDelay = window.Config.API.RETRY_DELAY;
        this.cache = new Map();
    }

    /**
     * Requête HTTP générique avec retry automatique
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Gestion du cache pour les requêtes GET
        const cacheKey = `${options.method || 'GET'}_${endpoint}`;
        if ((!options.method || options.method === 'GET') && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < window.Config.CACHE.TTL) {
                return cached.data;
            }
        }

        let lastError;
        for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Mettre en cache si c'est un GET
                if (!options.method || options.method === 'GET') {
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });

                    // Limiter la taille du cache
                    if (this.cache.size > window.Config.CACHE.MAX_SIZE) {
                        const firstKey = this.cache.keys().next().value;
                        this.cache.delete(firstKey);
                    }
                }

                return data;

            } catch (error) {
                lastError = error;

                if (attempt < this.retryAttempts) {
                    console.warn(`Tentative ${attempt + 1} échouée, retry dans ${this.retryDelay}ms:`, error);
                    await this.delay(this.retryDelay * Math.pow(2, attempt)); // Backoff exponentiel
                } else {
                    console.error(`Toutes les tentatives ont échoué pour ${endpoint}:`, error);
                }
            }
        }

        throw lastError;
    }

    /**
     * Méthodes HTTP raccourcies
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Méthodes spécialisées pour l'admin
     */

    // Health & Status
    async getHealth() {
        return this.get('/health');
    }

    async getSystemInfo() {
        return this.get('/health/system');
    }

    // Dashboard
    async getDashboardStats() {
        return this.get('/admin/dashboard');
    }

    // Brands
    async getBrands(params = {}) {
        return this.get('/admin/brands', params);
    }

    async getBrand(id) {
        return this.get(`/admin/brands/${id}`);
    }

    async createBrand(data) {
        return this.post('/admin/brands', data);
    }

    async updateBrand(id, data) {
        return this.put(`/admin/brands/${id}`, data);
    }

    async deleteBrand(id) {
        return this.delete(`/admin/brands/${id}`);
    }

    // Models
    async getModels(params = {}) {
        return this.get('/admin/models', params);
    }

    async getModel(id) {
        return this.get(`/admin/models/${id}`);
    }

    async createModel(data) {
        return this.post('/admin/models', data);
    }

    async updateModel(id, data) {
        return this.put(`/admin/models/${id}`, data);
    }

    async deleteModel(id) {
        return this.delete(`/admin/models/${id}`);
    }

    // Players
    async getPlayers(params = {}) {
        return this.get('/admin/players', params);
    }

    async getPlayer(userId) {
        return this.get(`/admin/players/${userId}`);
    }

    async createPlayer(data) {
        return this.post('/admin/players', data);
    }

    async updatePlayer(userId, data) {
        return this.put(`/admin/players/${userId}`, data);
    }

    async deletePlayer(userId) {
        return this.delete(`/admin/players/${userId}`);
    }

    async resetPlayerStats(userId) {
        return this.post(`/admin/players/${userId}/reset`);
    }

    // Games
    async getGames(params = {}) {
        return this.get('/admin/games', params);
    }

    async getGame(id) {
        return this.get(`/admin/games/${id}`);
    }

    async deleteGame(id) {
        return this.delete(`/admin/games/${id}`);
    }

    // Analytics
    async getAnalytics(params = {}) {
        return this.get('/admin/analytics', params);
    }

    async getDifficultyStats() {
        return this.get('/admin/analytics/difficulty');
    }

    async getBrandPopularity() {
        return this.get('/admin/analytics/brands');
    }

    async getActivityStats(period = '7d') {
        return this.get('/admin/analytics/activity', { period });
    }

    // Maintenance
    async executeMaintenanceAction(action) {
        return this.post('/admin/maintenance', { action });
    }

    async getLogs(params = {}) {
        return this.get('/admin/logs', params);
    }

    async clearCache() {
        this.cache.clear();
        return this.post('/admin/maintenance', { action: 'clear_cache' });
    }

    async createBackup() {
        return this.post('/admin/maintenance', { action: 'backup_db' });
    }

    // Export
    async exportData(table, format = 'csv', params = {}) {
        const response = await fetch(`${this.baseURL}/admin/export/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ format, ...params })
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.statusText}`);
        }

        return response.blob();
    }

    // Import
    async importData(table, file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('options', JSON.stringify(options));

        const response = await fetch(`${this.baseURL}/admin/import/${table}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Import failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Utilitaires
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: window.Config.CACHE.MAX_SIZE,
            ttl: window.Config.CACHE.TTL
        };
    }

    /**
     * Gestion des erreurs centralisée
     */
    handleError(error) {
        console.error('API Error:', error);

        let message = window.Config.MESSAGES.ERRORS.UNKNOWN;

        if (error.name === 'AbortError') {
            message = window.Config.MESSAGES.ERRORS.TIMEOUT;
        } else if (error.message.includes('404')) {
            message = window.Config.MESSAGES.ERRORS.NOT_FOUND;
        } else if (error.message.includes('401') || error.message.includes('403')) {
            message = window.Config.MESSAGES.ERRORS.UNAUTHORIZED;
        } else if (error.message.includes('500')) {
            message = window.Config.MESSAGES.ERRORS.SERVER;
        } else if (error.message.includes('Failed to fetch')) {
            message = window.Config.MESSAGES.ERRORS.NETWORK;
        }

        if (window.notifications) {
            window.notifications.error(message);
        }

        return { error: true, message };
    }
}

// Instance globale
window.api = new APIManager();
