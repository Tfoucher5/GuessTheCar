/* eslint-disable no-undef */
/**
 * Gestionnaire d'API pour l'interface d'administration
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
     * Requête générique avec retry et cache
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
                    const errorText = await response.text();
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch {
                        errorData = { error: errorText };
                    }

                    const error = new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    error.data = errorData;
                    throw error;
                }

                const data = await response.json();

                // Mettre en cache les requêtes GET réussies
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

                // Ne pas retry pour les erreurs client (4xx)
                if (error.status >= 400 && error.status < 500) {
                    break;
                }

                if (attempt < this.retryAttempts) {
                    const delay = this.retryDelay * Math.pow(2, attempt);
                    console.warn(`Tentative ${attempt + 1} échouée, retry dans ${delay}ms:`, error.message);
                    await this.delay(delay);
                } else {
                    console.error(`Toutes les tentatives ont échoué pour ${endpoint}:`, error);
                }
            }
        }

        // Afficher l'erreur à l'utilisateur
        this.handleError(lastError);
        throw lastError;
    }

    /**
     * Requête GET avec paramètres de query
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    /**
     * Requête POST
     */
    async post(endpoint, data = {}) {
        // Invalider le cache pour cet endpoint
        this.invalidateCache(endpoint);

        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Requête PUT
     */
    async put(endpoint, data = {}) {
        // Invalider le cache pour cet endpoint
        this.invalidateCache(endpoint);

        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Requête DELETE
     */
    async delete(endpoint) {
        // Invalider le cache pour cet endpoint
        this.invalidateCache(endpoint);

        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Upload de fichier
     */
    async upload(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData // Ne pas définir Content-Type pour FormData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText };
                }
                throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Invalider le cache pour un endpoint
     */
    invalidateCache(endpoint) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(endpoint)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Vider tout le cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Utilitaire de délai
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Gestion des erreurs
     */
    handleError(error) {
        console.error('API Error:', error);

        let message = window.Config.MESSAGES.ERRORS.UNKNOWN;

        if (error.name === 'AbortError') {
            message = window.Config.MESSAGES.ERRORS.TIMEOUT;
        } else if (error.status) {
            switch (error.status) {
            case 404:
                message = window.Config.MESSAGES.ERRORS.NOT_FOUND;
                break;
            case 401:
            case 403:
                message = window.Config.MESSAGES.ERRORS.UNAUTHORIZED;
                break;
            case 500:
                message = window.Config.MESSAGES.ERRORS.SERVER;
                break;
            default:
                message = error.message || window.Config.MESSAGES.ERRORS.UNKNOWN;
            }
        } else if (error.message.includes('Failed to fetch')) {
            message = window.Config.MESSAGES.ERRORS.NETWORK;
        } else {
            message = error.message;
        }

        // Afficher la notification d'erreur
        if (window.notifications) {
            window.notifications.error(message);
        }

        return { error: true, message };
    }

    /**
     * Vérifier la santé de l'API
     */
    async getHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Méthodes spécifiques pour l'administration
     */

    // Dashboard
    async getDashboardStats() {
        return this.get('/admin/dashboard');
    }

    // Marques
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

    // Modèles
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

    // Joueurs
    async getPlayers(params = {}) {
        return this.get('/admin/players', params);
    }

    async getPlayer(id) {
        return this.get(`/admin/players/${id}`);
    }

    async resetPlayerStats(id) {
        return this.post(`/admin/players/${id}/reset`);
    }

    async deletePlayer(id) {
        return this.delete(`/admin/players/${id}`);
    }

    // Parties
    async getGames(params = {}) {
        return this.get('/admin/games', params);
    }

    async getGame(id) {
        return this.get(`/admin/games/${id}`);
    }

    async deleteGame(id) {
        return this.delete(`/admin/games/${id}`);
    }

    // Système
    async getSystemInfo() {
        return this.get('/admin/system/info');
    }

    async getDatabaseInfo() {
        return this.get('/admin/system/database');
    }

    async clearSystemCache() {
        return this.post('/admin/system/clear-cache');
    }

    async getSystemLogs(type = 'combined', lines = 50) {
        return this.get('/admin/system/logs', { type, lines });
    }

    async getSystemHealth() {
        return this.get('/admin/system/health');
    }
}

// Créer l'instance globale
window.api = new APIManager();
