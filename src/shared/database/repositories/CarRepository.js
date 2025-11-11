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
     * Récupère une voiture aléatoire avec ses informations complètes (sélection pondérée par rareté)
     */
    async getRandomCar() {
        // Utiliser une sélection pondérée basée sur spawn_weight
        // La fonction RPC retourne seulement l'ID, puis on fait le join côté JS

        for (let i = 0; i < 5; i++) { // On essaie jusqu'à 5 fois
            try {
                // Appeler la fonction RPC qui retourne un ID
                const { data: carId, error } = await supabase.rpc('get_random_car_weighted');

                if (error) {
                    console.warn(`[Attempt ${i + 1}] RPC failed:`, error.message);

                    // Fallback : sélection simple aléatoire sans pondération
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('models')
                        .select(`
                            id, name, year, difficulty_level, image_url, brand_id, rarity, base_points, spawn_weight,
                            brands!inner (id, name, country)
                        `)
                        .not('rarity', 'is', null)
                        .not('spawn_weight', 'is', null)
                        .order('random()')
                        .limit(1)
                        .single();

                    if (fallbackError) {
                        console.warn(`[Attempt ${i + 1}] Fallback also failed:`, fallbackError.message);
                        continue;
                    }

                    if (fallbackData) {
                        return Car.fromDatabase({
                            id: fallbackData.id,
                            model: fallbackData.name,
                            modelDate: fallbackData.year,
                            difficulty: fallbackData.difficulty_level,
                            imageUrl: fallbackData.image_url,
                            brandId: fallbackData.brands.id,
                            brand: fallbackData.brands.name,
                            country: fallbackData.brands.country,
                            rarity: fallbackData.rarity,
                            base_points: fallbackData.base_points,
                            spawn_weight: fallbackData.spawn_weight
                        });
                    }
                    continue;
                }

                // Si on a un ID valide, récupérer la voiture complète avec le brand
                if (carId) {
                    const car = await this.getCarById(carId);
                    if (car) {
                        return car;
                    }
                }

            } catch (err) {
                console.error(`[Attempt ${i + 1}] Exception:`, err);
                continue;
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
                rarity,
                base_points,
                spawn_weight,
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
            country: data.brands.country,
            rarity: data.rarity,
            base_points: data.base_points,
            spawn_weight: data.spawn_weight
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
                rarity,
                base_points,
                spawn_weight,
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

        if (filters.rarity) {
            query = query.eq('rarity', filters.rarity);
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
            country: row.brands.country,
            rarity: row.rarity,
            base_points: row.base_points,
            spawn_weight: row.spawn_weight
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
