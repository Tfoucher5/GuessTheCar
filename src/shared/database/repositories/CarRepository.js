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
     * Récupère une voiture aléatoire avec ses informations complètes
     */
    async getRandomCar() {
        // Supabase ne supporte pas ORDER BY RANDOM() directement
        // On récupère d'abord le nombre total de voitures
        const { count } = await supabase
            .from('models')
            .select('*', { count: 'exact', head: true });

        if (!count || count === 0) return null;

        // Générer un offset aléatoire
        const randomOffset = Math.floor(Math.random() * count);

        // Récupérer une voiture à cet offset
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
            .range(randomOffset, randomOffset)
            .single();

        if (error) throw error;
        if (!data) return null;

        // Formater les données pour correspondre au format attendu
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
