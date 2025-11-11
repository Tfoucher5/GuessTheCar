const express = require('express');
const CarService = require('../../core/car/CarService');
const { validationMiddleware, schemas } = require('../../shared/utils/validation');
const logger = require('../../shared/utils/logger');
const { AppError } = require('../../shared/errors');

const router = express.Router();
const carService = new CarService();

// Middleware pour les réponses API
const sendResponse = (res, data, message = 'Success') => {
    res.json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * GET /api/cars/random
 * Récupère une voiture aléatoire
 */
router.get('/random', async(req, res, next) => {
    try {
        const car = await carService.getRandomCar();

        logger.info('Random car requested via API:', {
            car: car.getFullName(),
            difficulty: car.getDifficultyText()
        });

        sendResponse(res, car.toJSON(), 'Voiture aléatoire récupérée');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars/:id
 * Récupère une voiture par ID
 */
router.get('/:id', async(req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            throw new AppError('ID de voiture invalide', 400);
        }

        const car = await carService.getCarById(parseInt(id));
        sendResponse(res, car.toJSON(), 'Voiture récupérée');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars
 * Recherche des voitures avec filtres
 */
router.get('/', async(req, res, next) => {
    try {
        const filters = {};

        // Filtres optionnels
        if (req.query.makeId) {
            filters.makeId = parseInt(req.query.makeId);
        }
        if (req.query.difficulty) {
            filters.difficulty = parseInt(req.query.difficulty);
        }
        if (req.query.country) {
            filters.country = req.query.country;
        }
        if (req.query.year) {
            filters.year = parseInt(req.query.year);
        }
        if (req.query.limit) {
            filters.limit = Math.min(parseInt(req.query.limit), 100); // Max 100
        }

        const cars = await carService.searchCars(filters);

        sendResponse(res, {
            cars: cars.map(car => car.toJSON()),
            count: cars.length,
            filters
        }, 'Recherche de voitures effectuée');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars/makes
 * Récupère toutes les marques
 */
router.get('/meta/makes', async(req, res, next) => {
    try {
        const makes = await carService.getAllMakes();
        sendResponse(res, makes, 'Marques récupérées');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars/makes/:makeId/models
 * Récupère les modèles d'une marque
 */
router.get('/makes/:makeId/models', async(req, res, next) => {
    try {
        const { makeId } = req.params;

        if (!makeId || isNaN(makeId)) {
            throw new AppError('ID de marque invalide', 400);
        }

        const models = await carService.getModelsByMakeId(parseInt(makeId));
        sendResponse(res, models, 'Modèles récupérés');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars/meta/stats
 * Récupère les statistiques des voitures
 */
router.get('/meta/stats', async(req, res, next) => {
    try {
        const stats = await carService.getCarStats();
        sendResponse(res, stats, 'Statistiques récupérées');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars/meta/countries
 * Récupère les pays disponibles
 */
router.get('/meta/countries', async(req, res, next) => {
    try {
        const countries = await carService.getAvailableCountries();
        sendResponse(res, countries, 'Pays récupérés');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars/meta/years
 * Récupère les années disponibles
 */
router.get('/meta/years', async(req, res, next) => {
    try {
        const years = await carService.getAvailableYears();
        sendResponse(res, years, 'Années récupérées');
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/cars/:id/similar
 * Récupère des voitures similaires
 */
router.get('/:id/similar', async(req, res, next) => {
    try {
        const { id } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 5, 20);

        if (!id || isNaN(id)) {
            throw new AppError('ID de voiture invalide', 400);
        }

        const car = await carService.getCarById(parseInt(id));
        const similarCars = await carService.getSimilarCars(car, limit);

        sendResponse(res, {
            originalCar: car.toJSON(),
            similarCars: similarCars.map(c => c.toJSON()),
            count: similarCars.length
        }, 'Voitures similaires récupérées');
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/cars/validate
 * Valide qu'une voiture est appropriée pour un jeu
 */
router.post('/validate', validationMiddleware(schemas.difficulty), async(req, res, next) => {
    try {
        const { carId } = req.body;

        if (!carId || isNaN(carId)) {
            throw new AppError('ID de voiture requis', 400);
        }

        const car = await carService.getCarById(parseInt(carId));
        const isValid = carService.validateCarForGame(car);

        sendResponse(res, {
            car: car.toJSON(),
            isValid,
            validationDetails: {
                hasValidMake: !!(car.make && car.make.length >= 2),
                hasValidModel: !!(car.model && car.model.length >= 1),
                hasCountry: !!car.country,
                hasDifficulty: !!car.difficulty
            }
        }, 'Validation effectuée');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
