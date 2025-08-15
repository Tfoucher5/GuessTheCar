const fs = require('fs');
const path = require('path');
const logger = require('../../shared/utils/logger');

class EventHandler {
    constructor() {
        this.events = new Map();
    }

    /**
     * Charge tous les événements
     */
    loadEvents(client) {
        const eventsPath = path.join(__dirname, '../events');

        if (!fs.existsSync(eventsPath)) {
            logger.warn('Events directory not found');
            return;
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);

                if (event.name && typeof event.execute === 'function') {
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args));
                    }

                    this.events.set(event.name, event);
                    logger.debug(`Event loaded: ${event.name}`);
                } else {
                    logger.warn(`Invalid event file: ${file}`);
                }
            } catch (error) {
                logger.error(`Error loading event ${file}:`, error);
            }
        }

        logger.info(`Loaded ${this.events.size} events`);
    }

    /**
     * Obtient un événement par nom
     */
    getEvent(name) {
        return this.events.get(name);
    }

    /**
     * Obtient tous les événements
     */
    getAllEvents() {
        return Array.from(this.events.values());
    }
}

module.exports = new EventHandler();
