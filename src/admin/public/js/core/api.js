/* eslint-disable no-undef */
class APIManager {
    constructor() {
        this.baseURL = window.Config.API.BASE_URL;
        this.timeout = window.Config.API.TIMEOUT;
        this.retryAttempts = window.Config.API.RETRY_ATTEMPTS;
        this.retryDelay = window.Config.API.RETRY_DELAY;
        this.cache = new Map();
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

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

                if (!options.method || options.method === 'GET') {
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });

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
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                } else {
                    console.error(`Toutes les tentatives ont échoué pour ${endpoint}:`, error);
                }
            }
        }

        throw lastError;
    }

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

    clearCache() {
        this.cache.clear();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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

window.api = new APIManager();
