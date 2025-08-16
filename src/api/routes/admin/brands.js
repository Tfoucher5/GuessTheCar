const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/brands - Liste des marques avec filtres et pagination
 */
router.get('/', async(req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search = '',
            country = '',
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;

        let whereClause = '';
        let params = [];

        // Construire la clause WHERE
        const conditions = [];
        if (search) {
            conditions.push('b.name LIKE ?');
            params.push(`%${search}%`);
        }
        if (country) {
            conditions.push('b.country = ?');
            params.push(country);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        // Validation du tri
        const validSortFields = ['name', 'country', 'created_at', 'models_count'];
        const validSortOrders = ['asc', 'desc'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const sortDir = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

        // Requête principale avec comptage des modèles
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const query = `
            SELECT 
                b.*,
                COUNT(m.id) as models_count
            FROM brands b
            LEFT JOIN models m ON b.id = m.brand_id
            ${whereClause}
            GROUP BY b.id
            ORDER BY ${sortField === 'models_count' ? 'models_count' : 'b.' + sortField} ${sortDir}
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
                COUNT(m.id) as models_count
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
        const { name, country } = req.body;

        // Validation
        if (!name || !country) {
            return res.status(400).json({
                success: false,
                error: 'Le nom et le pays sont requis'
            });
        }

        if (name.length < 2 || name.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Le nom doit contenir entre 2 et 50 caractères'
            });
        }

        // Vérifier si la marque existe déjà
        const [existing] = await executeQuery('SELECT id FROM brands WHERE name = ?', [name]);
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Cette marque existe déjà'
            });
        }

        // Créer la marque
        const result = await executeQuery(
            'INSERT INTO brands (name, country) VALUES (?, ?)',
            [name, country]
        );

        const [newBrand] = await executeQuery('SELECT * FROM brands WHERE id = ?', [result.insertId]);

        logger.info('Brand created:', { id: result.insertId, name, country });

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
        const { name, country } = req.body;

        // Validation
        if (!name || !country) {
            return res.status(400).json({
                success: false,
                error: 'Le nom et le pays sont requis'
            });
        }

        // Vérifier si la marque existe
        const [existing] = await executeQuery('SELECT id FROM brands WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Vérifier les doublons (excluant la marque actuelle)
        const [duplicate] = await executeQuery('SELECT id FROM brands WHERE name = ? AND id != ?', [name, id]);
        if (duplicate) {
            return res.status(400).json({
                success: false,
                error: 'Une marque avec ce nom existe déjà'
            });
        }

        // Modifier la marque
        await executeQuery(
            'UPDATE brands SET name = ?, country = ? WHERE id = ?',
            [name, country, id]
        );

        const [updatedBrand] = await executeQuery('SELECT * FROM brands WHERE id = ?', [id]);

        logger.info('Brand updated:', { id, name, country });

        res.json({
            success: true,
            data: updatedBrand,
            message: 'Marque modifiée avec succès'
        });
    } catch (error) {
        logger.error('Error updating brand:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification de la marque'
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
        const [brand] = await executeQuery('SELECT * FROM brands WHERE id = ?', [id]);
        if (!brand) {
            return res.status(404).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Vérifier s'il y a des modèles associés
        const [modelsCount] = await executeQuery('SELECT COUNT(*) as count FROM models WHERE brand_id = ?', [id]);
        if (modelsCount.count > 0) {
            return res.status(400).json({
                success: false,
                error: `Impossible de supprimer cette marque car elle contient ${modelsCount.count} modèle(s)`
            });
        }

        // Supprimer la marque
        await executeQuery('DELETE FROM brands WHERE id = ?', [id]);

        logger.info('Brand deleted:', { id, name: brand.name });

        res.json({
            success: true,
            message: 'Marque supprimée avec succès'
        });
    } catch (error) {
        logger.error('Error deleting brand:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la marque'
        });
    }
});

module.exports = router;
