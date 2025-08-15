const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Car = require('../../../core/car/Car');

class CarRepository extends BaseRepository {
    constructor() {
        super('models');
    }

    /**
     * Récupère toutes les marques
     */
    async getAllMakes() {
        const query = 'SELECT * FROM brands ORDER BY name ASC';
        return await executeQuery(query);
    }

    /**
     * Récupère les modèles d'une marque
     */
    async getModelsByMakeId(brandId) {
        const query = `
            SELECT m.*, b.name as brand_name, b.country
            FROM models m 
            JOIN brands b ON m.brand_id = b.id 
            WHERE m.brand_id = ?
            ORDER BY m.name ASC
        `;
        return await executeQuery(query, [brandId]);
    }

    /**
     * Récupère une voiture aléatoire avec ses informations complètes
     */
    async getRandomCar() {
        const query = `
            SELECT 
                m.id,
                m.name as model,
                m.year as modelDate,
                m.difficulty_level as difficulty,
                m.image_url as imageUrl,
                b.id as brandId,
                b.name as brand,
                b.country
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            ORDER BY RAND()
            LIMIT 1
        `;

        const results = await executeQuery(query);

        if (results.length === 0) {
            return null;
        }

        return Car.fromDatabase(results[0]);
    }

    /**
     * Récupère une voiture par ID avec informations complètes
     */
    async getCarById(id) {
        const query = `
            SELECT 
                m.id,
                m.name as model,
                m.year as modelDate,
                m.difficulty_level as difficulty,
                m.image_url as imageUrl,
                b.id as brandId,
                b.name as brand,
                b.country
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            WHERE m.id = ?
        `;

        const results = await executeQuery(query, [id]);

        if (results.length === 0) {
            return null;
        }

        return Car.fromDatabase(results[0]);
    }

    /**
     * Recherche des voitures par critères
     */
    async searchCars(filters = {}) {
        let query = `
            SELECT 
                m.id,
                m.name as model,
                m.year as modelDate,
                m.difficulty_level as difficulty,
                m.image_url as imageUrl,
                b.id as brandId,
                b.name as brand,
                b.country
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            WHERE 1=1
        `;

        const params = [];

        if (filters.brandId) {
            query += ' AND b.id = ?';
            params.push(filters.brandId);
        }

        if (filters.difficulty) {
            query += ' AND m.difficulty_level = ?';
            params.push(filters.difficulty);
        }

        if (filters.country) {
            query += ' AND b.country = ?';
            params.push(filters.country);
        }

        if (filters.year) {
            query += ' AND m.year = ?';
            params.push(filters.year);
        }

        query += ' ORDER BY b.name ASC, m.name ASC';

        if (filters.limit) {
            query += ` LIMIT ${parseInt(filters.limit)}`;
        }

        const results = await executeQuery(query, params);
        return results.map(row => Car.fromDatabase(row));
    }

    /**
     * Obtient les statistiques des voitures
     */
    async getCarStats() {
        const query = `
            SELECT 
                COUNT(*) as totalCars,
                COUNT(DISTINCT b.id) as totalBrands,
                AVG(m.difficulty_level) as avgDifficulty,
                COUNT(CASE WHEN m.difficulty_level = 1 THEN 1 END) as easyCars,
                COUNT(CASE WHEN m.difficulty_level = 2 THEN 1 END) as mediumCars,
                COUNT(CASE WHEN m.difficulty_level = 3 THEN 1 END) as hardCars
            FROM models m
            JOIN brands b ON m.brand_id = b.id
        `;

        const results = await executeQuery(query);
        return results[0];
    }

    /**
     * Obtient les pays disponibles
     */
    async getAvailableCountries() {
        const query = 'SELECT DISTINCT country FROM brands WHERE country IS NOT NULL ORDER BY country ASC';
        const results = await executeQuery(query);
        return results.map(row => row.country);
    }

    /**
     * Obtient les années disponibles
     */
    async getAvailableYears() {
        const query = 'SELECT DISTINCT year FROM models WHERE year IS NOT NULL ORDER BY year DESC';
        const results = await executeQuery(query);
        return results.map(row => row.year);
    }

    /**
     * Obtient les marques disponibles
     */
    async getAvailableBrands() {
        const query = 'SELECT DISTINCT name as brand FROM brands ORDER BY name ASC';
        const results = await executeQuery(query);
        return results.map(row => row.brand);
    }
}

module.exports = CarRepository;