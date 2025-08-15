const CarRepository = require('../../shared/database/repositories/CarRepository');
const Car = require('./Car');
const { NotFoundError } = require('../../shared/errors');
const logger = require('../../shared/utils/logger');

class CarService {
    constructor() {
        this.carRepository = new CarRepository();
    }

    /**
     * Obtient une voiture aléatoire
     */
    async getRandomCar() {
        try {
            const car = await this.carRepository.getRandomCar();

            if (!car) {
                throw new NotFoundError('Aucune voiture disponible dans la base de données');
            }

            if (!car.isValid()) {
                logger.warn('Invalid car data retrieved:', car);
                throw new Error('Données de voiture invalides');
            }

            logger.debug('Random car retrieved:', { make: car.make, model: car.model });
            return car;
        } catch (error) {
            logger.error('Error getting random car:', error);
            throw error;
        }
    }

    /**
     * Crée une voiture depuis des données
     */
    createCarFromData(carData) {
        return new Car(carData);
    }

    /**
     * Obtient une voiture par ID
     */
    async getCarById(id) {
        try {
            const car = await this.carRepository.getCarById(id);

            if (!car) {
                throw new NotFoundError(`Voiture avec l'ID ${id} non trouvée`);
            }

            return car;
        } catch (error) {
            logger.error('Error getting car by ID:', { id, error });
            throw error;
        }
    }

    /**
     * Recherche des voitures selon des critères
     */
    async searchCars(filters = {}) {
        try {
            const cars = await this.carRepository.searchCars(filters);
            logger.debug('Cars search completed:', { filters, count: cars.length });
            return cars;
        } catch (error) {
            logger.error('Error searching cars:', { filters, error });
            throw error;
        }
    }

    /**
     * Obtient toutes les marques
     */
    async getAllMakes() {
        try {
            const makes = await this.carRepository.getAllMakes();
            return makes;
        } catch (error) {
            logger.error('Error getting all makes:', error);
            throw error;
        }
    }

    /**
     * Obtient les modèles d'une marque
     */
    async getModelsByMakeId(makeId) {
        try {
            const models = await this.carRepository.getModelsByMakeId(makeId);
            return models;
        } catch (error) {
            logger.error('Error getting models by make ID:', { makeId, error });
            throw error;
        }
    }

    /**
     * Obtient les statistiques des voitures
     */
    async getCarStats() {
        try {
            const stats = await this.carRepository.getCarStats();
            return stats;
        } catch (error) {
            logger.error('Error getting car stats:', error);
            throw error;
        }
    }

    /**
     * Obtient les pays disponibles
     */
    async getAvailableCountries() {
        try {
            const countries = await this.carRepository.getAvailableCountries();
            return countries;
        } catch (error) {
            logger.error('Error getting available countries:', error);
            throw error;
        }
    }

    /**
     * Obtient les années disponibles
     */
    async getAvailableYears() {
        try {
            const years = await this.carRepository.getAvailableYears();
            return years;
        } catch (error) {
            logger.error('Error getting available years:', error);
            throw error;
        }
    }

    /**
     * Valide qu'une voiture est appropriée pour un jeu
     */
    validateCarForGame(car) {
        if (!car.isValid()) {
            throw new Error('Voiture invalide pour le jeu');
        }

        if (!car.make || car.make.length < 2) {
            throw new Error('Nom de marque trop court');
        }

        if (!car.model || car.model.length < 1) {
            throw new Error('Nom de modèle trop court');
        }

        return true;
    }

    /**
     * Obtient une voiture aléatoire avec validation
     */
    async getValidRandomCar(maxAttempts = 10) {
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const car = await this.getRandomCar();
                this.validateCarForGame(car);
                return car;
            } catch (error) {
                attempts++;
                logger.warn(`Attempt ${attempts} failed to get valid car:`, error.message);

                if (attempts >= maxAttempts) {
                    throw new Error('Impossible d\'obtenir une voiture valide après plusieurs tentatives');
                }
            }
        }
    }

    /**
     * Obtient des suggestions de voitures similaires
     */
    async getSimilarCars(car, limit = 5) {
        try {
            const filters = {
                makeId: car.makeId,
                limit: limit + 1 // +1 pour exclure la voiture actuelle
            };

            const similarCars = await this.searchCars(filters);

            // Exclure la voiture actuelle
            return similarCars.filter(c => c.id !== car.id).slice(0, limit);
        } catch (error) {
            logger.error('Error getting similar cars:', error);
            return [];
        }
    }
}

module.exports = CarService;
