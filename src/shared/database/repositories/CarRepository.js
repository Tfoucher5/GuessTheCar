// src/shared/database/repositories/CarRepository.js
const BaseRepository = require('./BaseRepository');
const { supabase } = require('../connection');
const Car = require('../../../core/car/Car');

class CarRepository extends BaseRepository {
    constructor() {
        super('models');
    }

    /**
     * Récupère toutes les marques
     */
    async getAllMakes() {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Récupère les modèles d'une marque
     */
    async getModelsByMakeId(brandId) {
        const { data, error } = await supabase
            .from('models')
            .select(`
                *,
                brands!inner (
                    name,
                    country
                )
            `)
            .eq('brand_id', brandId)
            .order('name', { ascending: true });

        if (error) throw error;

        // Reformater pour correspondre à l'ancien format
        return data.map(row => ({
            ...row,
            brand_name: row.brands.name,
            country: row.brands.country
        }));
    }

    /**
     * Récupère une voiture aléatoire avec ses informations complètes (version sécurisée)
     */
    async getRandomCar() {
        const { count, error: countError } = await supabase
            .from('models')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Supabase error counting cars:', countError);
            throw new Error('Impossible de compter les voitures dans la base de données.');
        }
        if (!count || count === 0) {
            return null;
        }

        // --- Tentatives multiples pour éviter les données corrompues ---
        for (let i = 0; i < 5; i++) { // On essaie jusqu'à 5 fois
            const randomOffset = Math.floor(Math.random() * count);

            const { data, error } = await supabase
                .from('models')
                .select(`
                    id, name, year, difficulty_level, image_url, brand_id,
                    brands (id, name, country) // On retire !inner pour une jointure externe
                `)
                .range(randomOffset, randomOffset)
                .single();

            // Si on a une voiture ET que sa marque existe, c'est bon !
            if (data && data.brands) {
                return Car.fromDatabase({
                    id: data.id,
                    model: data.name,
                    modelDate: data.year,
                    difficulty: data.difficulty_level,
                    imageUrl: data.image_url,
                    brandId: data.brands.id,
                    brand: data.brands.name,
                    country: data.brands.country
                });
            }

            // Si on est ici, c'est que la voiture est invalide ou qu'il y a eu une erreur.
            if (error) {
                console.warn(`[Attempt ${i + 1}] Failed to fetch a valid random car. Error:`, error.message);
            } else if (!data?.brands) {
                console.warn(`[Attempt ${i + 1}] Fetched a car (id: ${data?.id}) but its brand is missing. Retrying...`);
            }
        }

        // Si après 5 tentatives on n'a rien, on lève une erreur claire.
        throw new Error('Impossible de récupérer une voiture valide depuis la base de données après plusieurs tentatives.');
    }

    /**
     * Récupère une voiture par ID avec informations complètes
     */
    async getCarById(id) {
        const { data, error } = await supabase
            .from('models')
            .select(`
                id,
                name,
                year,
                difficulty_level,
                image_url,
                brand_id,
                brands!inner (
                    id,
                    name,
                    country
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        if (!data) return null;

        // Formater les données
        return Car.fromDatabase({
            id: data.id,
            model: data.name,
            modelDate: data.year,
            difficulty: data.difficulty_level,
            imageUrl: data.image_url,
            brandId: data.brands.id,
            brand: data.brands.name,
            country: data.brands.country
        });
    }

    /**
     * Recherche des voitures par critères
     */
    async searchCars(filters = {}) {
        let query = supabase
            .from('models')
            .select(`
                id,
                name,
                year,
                difficulty_level,
                image_url,
                brand_id,
                brands!inner (
                    id,
                    name,
                    country
                )
            `);

        // Appliquer les filtres
        if (filters.brandId) {
            query = query.eq('brand_id', filters.brandId);
        }

        if (filters.difficulty) {
            query = query.eq('difficulty_level', filters.difficulty);
        }

        if (filters.country) {
            query = query.eq('brands.country', filters.country);
        }

        if (filters.year) {
            query = query.eq('year', filters.year);
        }

        // Tri
        query = query.order('name', { ascending: true });

        // Limite
        if (filters.limit) {
            query = query.limit(parseInt(filters.limit));
        }

        const { data, error } = await query;
        if (error) throw error;

        // Formater les résultats
        return data.map(row => Car.fromDatabase({
            id: row.id,
            model: row.name,
            modelDate: row.year,
            difficulty: row.difficulty_level,
            imageUrl: row.image_url,
            brandId: row.brands.id,
            brand: row.brands.name,
            country: row.brands.country
        }));
    }

    /**
     * Obtient les statistiques des voitures
     */
    async getCarStats() {
        // Nombre total de voitures
        const { count: totalCars } = await supabase
            .from('models')
            .select('*', { count: 'exact', head: true });

        // Nombre total de marques
        const { count: totalBrands } = await supabase
            .from('brands')
            .select('*', { count: 'exact', head: true });

        // Récupérer toutes les voitures pour calculer les stats
        const { data: cars } = await supabase
            .from('models')
            .select('difficulty_level');

        // Calculer les statistiques
        const easyCars = cars?.filter(c => c.difficulty_level === 1).length || 0;
        const mediumCars = cars?.filter(c => c.difficulty_level === 2).length || 0;
        const hardCars = cars?.filter(c => c.difficulty_level === 3).length || 0;

        const avgDifficulty = cars && cars.length > 0
            ? cars.reduce((sum, c) => sum + (c.difficulty_level || 0), 0) / cars.length
            : 0;

        return {
            totalCars: totalCars || 0,
            totalBrands: totalBrands || 0,
            avgDifficulty: avgDifficulty.toFixed(2),
            easyCars,
            mediumCars,
            hardCars
        };
    }

    /**
     * Obtient les pays disponibles
     */
    async getAvailableCountries() {
        const { data, error } = await supabase
            .from('brands')
            .select('country')
            .not('country', 'is', null)
            .order('country', { ascending: true });

        if (error) throw error;

        // Obtenir les valeurs uniques
        const uniqueCountries = [...new Set(data.map(row => row.country))];
        return uniqueCountries.sort();
    }

    /**
     * Obtient les années disponibles
     */
    async getAvailableYears() {
        const { data, error } = await supabase
            .from('models')
            .select('year')
            .not('year', 'is', null)
            .order('year', { ascending: false });

        if (error) throw error;

        // Obtenir les valeurs uniques
        const uniqueYears = [...new Set(data.map(row => row.year))];
        return uniqueYears.sort((a, b) => b - a);
    }

    /**
     * Obtient les marques disponibles
     */
    async getAvailableBrands() {
        const { data, error } = await supabase
            .from('brands')
            .select('name')
            .order('name', { ascending: true });

        if (error) throw error;

        return data.map(row => row.name);
    }
}

module.exports = CarRepository;
