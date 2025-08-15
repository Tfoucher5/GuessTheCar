const BaseRepository = require('./BaseRepository');
const { executeQuery } = require('../connection');
const Car = require('../../../core/car/Car');

class CarRepository extends BaseRepository {
    constructor() {
        super('modeles');
    }

    /**
     * Récupère toutes les marques
     */
    async getAllMakes() {
        const query = 'SELECT * FROM marques ORDER BY nom ASC';
        return await executeQuery(query);
    }

    /**
     * Récupère les modèles d'une marque
     */
    async getModelsByMakeId(makeId) {
        const query = `
            SELECT m.*, ma.nom as marque_nom, ma.pays 
            FROM modeles m 
            JOIN marques ma ON m.marque_id = ma.id 
            WHERE m.marque_id = ?
            ORDER BY m.nom ASC
        `;
        return await executeQuery(query, [makeId]);
    }

    /**
     * Récupère une voiture aléatoire avec ses informations complètes
     */
    async getRandomCar() {
        const query = `
            SELECT 
                m.id,
                m.nom as model,
                m.annee as modelDate,
                m.difficulte as difficulty,
                ma.id as makeId,
                ma.nom as make,
                ma.pays as country
            FROM modeles m
            JOIN marques ma ON m.marque_id = ma.id
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
                m.nom as model,
                m.annee as modelDate,
                m.difficulte as difficulty,
                ma.id as makeId,
                ma.nom as make,
                ma.pays as country
            FROM modeles m
            JOIN marques ma ON m.marque_id = ma.id
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
                m.nom as model,
                m.annee as modelDate,
                m.difficulte as difficulty,
                ma.id as makeId,
                ma.nom as make,
                ma.pays as country
            FROM modeles m
            JOIN marques ma ON m.marque_id = ma.id
            WHERE 1=1
        `;

        const params = [];

        if (filters.makeId) {
            query += ' AND ma.id = ?';
            params.push(filters.makeId);
        }

        if (filters.difficulty) {
            query += ' AND m.difficulte = ?';
            params.push(filters.difficulty);
        }

        if (filters.country) {
            query += ' AND ma.pays = ?';
            params.push(filters.country);
        }

        if (filters.year) {
            query += ' AND m.annee = ?';
            params.push(filters.year);
        }

        query += ' ORDER BY ma.nom ASC, m.nom ASC';

        if (filters.limit) {
            query += ` LIMIT ${filters.limit}`;
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
                COUNT(DISTINCT ma.id) as totalMakes,
                COUNT(DISTINCT ma.pays) as totalCountries,
                AVG(m.difficulte) as avgDifficulty,
                COUNT(CASE WHEN m.difficulte = 1 THEN 1 END) as easyCars,
                COUNT(CASE WHEN m.difficulte = 2 THEN 1 END) as mediumCars,
                COUNT(CASE WHEN m.difficulte = 3 THEN 1 END) as hardCars
            FROM modeles m
            JOIN marques ma ON m.marque_id = ma.id
        `;

        const results = await executeQuery(query);
        return results[0];
    }

    /**
     * Obtient les pays disponibles
     */
    async getAvailableCountries() {
        const query = 'SELECT DISTINCT pays as country FROM marques ORDER BY pays ASC';
        const results = await executeQuery(query);
        return results.map(row => row.country);
    }

    /**
     * Obtient les années disponibles
     */
    async getAvailableYears() {
        const query = 'SELECT DISTINCT annee as year FROM modeles ORDER BY annee ASC';
        const results = await executeQuery(query);
        return results.map(row => row.year);
    }
}

module.exports = CarRepository;
