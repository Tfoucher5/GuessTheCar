const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/brands - Liste des marques avec pagination
 */
router.get('/', async(req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search = '',
            sortBy = 'name',
            sortOrder = 'asc',
            country = ''
        } = req.query;

        // Construction de la requête
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search) {
            whereClause += ' AND (b.name LIKE ? OR b.country LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (country) {
            whereClause += ' AND b.country = ?';
            params.push(country);
        }

        const validSortFields = ['name', 'country', 'created_at', 'model_count'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const sortDir = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Requête avec comptage des modèles
        const query = `
            SELECT 
                b.*,
                COUNT(m.id) as model_count
            FROM brands b
            LEFT JOIN models m ON b.id = m.brand_id
            ${whereClause}
            GROUP BY b.id
            ORDER BY ${sortField === 'model_count' ? 'model_count' : 'b.' + sortField} ${sortDir}
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);
        const brands = await executeQuery(query, params);

        // Comptage total
        const countQuery = `
            SELECT COUNT(DISTINCT b.id) as total
            FROM brands b
            ${whereClause}
        `;
        const countParams = params.slice(0, -2);
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                brands,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(total),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching brands:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des marques'
        });
    }
});

/**
 * GET /api/admin/brands/:id - Détails d'une marque
 */
router.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const [brand] = await executeQuery(`
            SELECT 
                b.*,
                COUNT(m.id) as model_count
            FROM brands b
            LEFT JOIN models m ON b.id = m.brand_id
            WHERE b.id = ?
            GROUP BY b.id
        `, [id]);

        if (!brand) {
            return res.status(404).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Récupérer les modèles de cette marque
        const models = await executeQuery(`
            SELECT id, name, year, difficulty_level
            FROM models 
            WHERE brand_id = ?
            ORDER BY name ASC
        `, [id]);

        brand.models = models;

        res.json({
            success: true,
            data: brand
        });
    } catch (error) {
        logger.error('Error fetching brand:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement de la marque'
        });
    }
});

/**
 * POST /api/admin/brands - Créer une nouvelle marque
 */
router.post('/', async(req, res) => {
    try {
        const { name, country, logo_url } = req.body;

        // Validation
        if (!name || !country) {
            return res.status(400).json({
                success: false,
                error: 'Le nom et le pays sont requis'
            });
        }

        // Vérifier si la marque existe déjà
        const [existing] = await executeQuery(
            'SELECT id FROM brands WHERE name = ?',
            [name]
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Une marque avec ce nom existe déjà'
            });
        }

        // Créer la marque
        const result = await executeQuery(`
            INSERT INTO brands (name, country, logo_url, created_at)
            VALUES (?, ?, ?, NOW())
        `, [name, country, logo_url || null]);

        const [newBrand] = await executeQuery(
            'SELECT * FROM brands WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: newBrand,
            message: 'Marque créée avec succès'
        });
    } catch (error) {
        logger.error('Error creating brand:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la marque'
        });
    }
});

/**
 * PUT /api/admin/brands/:id - Modifier une marque
 */
router.put('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { name, country, logo_url } = req.body;

        // Validation
        if (!name || !country) {
            return res.status(400).json({
                success: false,
                error: 'Le nom et le pays sont requis'
            });
        }

        // Vérifier si la marque existe
        const [existing] = await executeQuery(
            'SELECT id FROM brands WHERE id = ?',
            [id]
        );

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Vérifier si le nom est déjà utilisé par une autre marque
        const [duplicate] = await executeQuery(
            'SELECT id FROM brands WHERE name = ? AND id != ?',
            [name, id]
        );

        if (duplicate) {
            return res.status(409).json({
                success: false,
                error: 'Une autre marque avec ce nom existe déjà'
            });
        }

        // Mettre à jour la marque
        await executeQuery(`
            UPDATE brands 
            SET name = ?, country = ?, logo_url = ?, updated_at = NOW()
            WHERE id = ?
        `, [name, country, logo_url || null, id]);

        const [updatedBrand] = await executeQuery(
            'SELECT * FROM brands WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            data: updatedBrand,
            message: 'Marque mise à jour avec succès'
        });
    } catch (error) {
        logger.error('Error updating brand:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de la marque'
        });
    }
});

/**
 * DELETE /api/admin/brands/:id - Supprimer une marque
 */
router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si la marque existe
        const [existing] = await executeQuery(
            'SELECT id, name FROM brands WHERE id = ?',
            [id]
        );

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Vérifier s'il y a des modèles associés
        const [modelCount] = await executeQuery(
            'SELECT COUNT(*) as count FROM models WHERE brand_id = ?',
            [id]
        );

        if (modelCount.count > 0) {
            return res.status(400).json({
                success: false,
                error: `Impossible de supprimer la marque ${existing.name}. Elle contient ${modelCount.count} modèle(s).`
            });
        }

        // Supprimer la marque
        await executeQuery('DELETE FROM brands WHERE id = ?', [id]);

        res.json({
            success: true,
            message: `Marque ${existing.name} supprimée avec succès`
        });
    } catch (error) {
        logger.error('Error deleting brand:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la marque'
        });
    }
});

/**
 * GET /api/admin/brands/countries - Liste des pays disponibles
 */
router.get('/meta/countries', async(req, res) => {
    try {
        const countries = await executeQuery(`
            SELECT DISTINCT country
            FROM brands
            WHERE country IS NOT NULL AND country != ''
            ORDER BY country ASC
        `);

        res.json({
            success: true,
            data: countries.map(row => row.country)
        });
    } catch (error) {
        logger.error('Error fetching countries:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des pays'
        });
    }
});

module.exports = router;
