/**
 * GameEngineManager - Singleton manager for GameEngine instance
 * Resolves circular dependency issues and provides clean access pattern
 */

const GameEngine = require('./GameEngine');
const logger = require('../../shared/utils/logger');

class GameEngineManager {
    constructor() {
        this._instance = null;
    }

    /**
     * Initialize the GameEngine instance
     * Should be called once during application startup
     */
    initialize() {
        if (this._instance) {
            logger.warn('GameEngine already initialized');
            return this._instance;
        }

        this._instance = new GameEngine();
        logger.info('✅ GameEngine initialized');
        return this._instance;
    }

    /**
     * Get the GameEngine instance
     * @returns {GameEngine} The GameEngine instance
     * @throws {Error} If GameEngine hasn't been initialized
     */
    getInstance() {
        if (!this._instance) {
            // Fallback: auto-initialize if not done yet
            logger.warn('GameEngine not initialized, auto-initializing...');
            return this.initialize();
        }
        return this._instance;
    }

    /**
     * Check if GameEngine is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this._instance !== null;
    }

    /**
     * Reset the GameEngine instance (useful for testing)
     */
    reset() {
        this._instance = null;
        logger.info('GameEngine instance reset');
    }
}

// Export singleton instance
module.exports = new GameEngineManager();
