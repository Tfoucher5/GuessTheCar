const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Car = require('../../../core/car/Car');

class CarRepository extends BaseRepository {
    constructor() {
        super('models');
    }

    async getAllMakes() {
        const query = 'SELECT * FROM brands ORDER BY name ASC';
        return await executeQuery(query);
    }

    async getModelsByMakeId(brandId) {
        const query = `
            SELECT m.*, b.name as brand_name
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            WHERE m.brand_id = ?
            ORDER BY m.name ASC
        `;
        return await executeQuery(query, [brandId]);
    }

    async getRandomCar() {
        const query = `
            SELECT 
                m.id,
                m.name as model,
                m.difficulty_level as difficulty,
                m.image_url as imageUrl,
                b.id as brandId,
                b.name as brand
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            ORDER BY RAND()
            LIMIT 1
        `;
        const results = await executeQuery(query);
        if (results.length === 0) return null;
        return Car.fromDatabase(results[0]);
    }

    async getCarById(id) {
        const query = `
            SELECT 
                m.id,
                m.name as model,
                m.difficulty_level as difficulty,
                m.image_url as imageUrl,
                b.id as brandId,
                b.name as brand
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            WHERE m.id = ?
        `;
        const results = await executeQuery(query, [id]);
        if (results.length === 0) return null;
        return Car.fromDatabase(results[0]);
    }

    async searchCars(filters = {}) {
        let query = `
            SELECT 
                m.id,
                m.name as model,
                m.difficulty_level as difficulty,
                m.image_url as imageUrl,
                b.id as brandId,
                b.name as brand
            FROM models m
            JOIN brands b ON m.brand_id = b.id
            WHERE 1=1
        `;
        const params = [];
        if (filters.brandId) { query += ' AND b.id = ?'; params.push(filters.brandId); }
        if (filters.difficulty) { query += ' AND m.difficulty_level = ?'; params.push(filters.difficulty); }
        query += ' ORDER BY b.name ASC, m.name ASC';
        if (filters.limit) query += ` LIMIT ${filters.limit}`;
        const results = await executeQuery(query, params);
        return results.map(row => Car.fromDatabase(row));
    }

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

    async getAvailableBrands() {
        const query = 'SELECT DISTINCT name as brand FROM brands ORDER BY name ASC';
        const results = await executeQuery(query);
        return results.map(row => row.brand);
    }
}

module.exports = CarRepository;
