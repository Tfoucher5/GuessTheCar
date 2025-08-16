const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/models - Liste des modèles avec filtres et pagination
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search = '',
            brand_id = '',
            difficulty_level = '',
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;

        let whereClause = '';
        let params = [];

        // Construire la clause WHERE
        const conditions = [];
        if (search) {
            conditions.push('m.name LIKE ?');
            params.push(`%${search}%`);
        }
        if (brand_id) {
            conditions.push('m.brand_id = ?');
            params.push(brand_id);
        }
        if (difficulty_level) {
            conditions.push('m.difficulty_level = ?');
            params.push(difficulty_level);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        // Validation du tri
        const validSortFields = ['name', 'year', 'difficulty_level', 'brand_name', 'created_at'];
        const validSortOrders = ['asc', 'desc'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
        const sortDir = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

        // Requête principale avec nom de marque
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const sortColumn = sortField === 'brand_name' ? 'b.name' : 
                          sortField === 'name' ? 'm.name' : 
                          'm.' + sortField;

        const query = `
            SELECT 
                m.*,
                b.name as brand_name,
                b.country as brand_country
            FROM models m
            INNER JOIN brands b ON m.brand_id = b.id
            ${whereClause}
            ORDER BY ${sortColumn} ${sortDir}
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);
        const models = await executeQuery(query, params);

        // Comptage total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM models m
            INNER JOIN brands b ON m.brand_id = b.id
            ${whereClause}
        `;
        const countParams = params.slice(0, -2);
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                models,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(total),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching models:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification du modèle'
        });
    }
});

/**
 * DELETE /api/admin/models/:id - Supprimer un modèle
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que le modèle existe
        const [model] = await executeQuery('SELECT * FROM models WHERE id = ?', [id]);
        if (!model) {
            return res.status(404).json({
                success: false,
                error: 'Modèle non trouvé'
            });
        }

        // Vérifier s'il y a des parties en cours avec ce modèle
        const [gamesCount] = await executeQuery(
            'SELECT COUNT(*) as count FROM game_sessions WHERE car_id = ? AND completed = 0',
            [id]
        );
        
        if (gamesCount.count > 0) {
            return res.status(400).json({
                success: false,
                error: 'Impossible de supprimer ce modèle car il est utilisé dans des parties en cours'
            });
        }

        // Supprimer le modèle
        await executeQuery('DELETE FROM models WHERE id = ?', [id]);

        logger.info('Model deleted:', { id, name: model.name });

        res.json({
            success: true,
            message: 'Modèle supprimé avec succès'
        });
    } catch (error) {
        logger.error('Error deleting model:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du modèle'
        });
    }
});

module.exports = router; 'Erreur lors du chargement des modèles'
        });
    }
});

/**
 * GET /api/admin/models/:id - Détails d'un modèle
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [model] = await executeQuery(`
            SELECT 
                m.*,
                b.name as brand_name,
                b.country as brand_country
            FROM models m
            INNER JOIN brands b ON m.brand_id = b.id
            WHERE m.id = ?
        `, [id]);

        if (!model) {
            return res.status(404).json({
                success: false,
                error: 'Modèle non trouvé'
            });
        }

        res.json({
            success: true,
            data: model
        });
    } catch (error) {
        logger.error('Error fetching model:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement du modèle'
        });
    }
});

/**
 * POST /api/admin/models - Créer un nouveau modèle
 */
router.post('/', async (req, res) => {
    try {
        const { name, brand_id, year, difficulty_level, image_url } = req.body;

        // Validation
        if (!name || !brand_id || !difficulty_level) {
            return res.status(400).json({
                success: false,
                error: 'Le nom, la marque et la difficulté sont requis'
            });
        }

        if (![1, 2, 3].includes(parseInt(difficulty_level))) {
            return res.status(400).json({
                success: false,
                error: 'La difficulté doit être 1, 2 ou 3'
            });
        }

        // Vérifier que la marque existe
        const [brand] = await executeQuery('SELECT id FROM brands WHERE id = ?', [brand_id]);
        if (!brand) {
            return res.status(400).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Vérifier les doublons
        const [existing] = await executeQuery(
            'SELECT id FROM models WHERE name = ? AND brand_id = ?',
            [name, brand_id]
        );
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Ce modèle existe déjà pour cette marque'
            });
        }

        // Créer le modèle
        const result = await executeQuery(`
            INSERT INTO models (name, brand_id, year, difficulty_level, image_url) 
            VALUES (?, ?, ?, ?, ?)
        `, [name, brand_id, year || new Date().getFullYear(), difficulty_level, image_url || null]);

        const [newModel] = await executeQuery(`
            SELECT 
                m.*,
                b.name as brand_name
            FROM models m
            INNER JOIN brands b ON m.brand_id = b.id
            WHERE m.id = ?
        `, [result.insertId]);

        logger.info('Model created:', { id: result.insertId, name, brand_id });

        res.status(201).json({
            success: true,
            data: newModel,
            message: 'Modèle créé avec succès'
        });
    } catch (error) {
        logger.error('Error creating model:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création du modèle'
        });
    }
});

/**
 * PUT /api/admin/models/:id - Modifier un modèle
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand_id, year, difficulty_level, image_url } = req.body;

        // Vérifier que le modèle existe
        const [existing] = await executeQuery('SELECT id FROM models WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Modèle non trouvé'
            });
        }

        // Vérifier que la marque existe
        if (brand_id) {
            const [brand] = await executeQuery('SELECT id FROM brands WHERE id = ?', [brand_id]);
            if (!brand) {
                return res.status(400).json({
                    success: false,
                    error: 'Marque non trouvée'
                });
            }
        }

        // Modifier le modèle
        await executeQuery(`
            UPDATE models 
            SET name = ?, brand_id = ?, year = ?, difficulty_level = ?, image_url = ?
            WHERE id = ?
        `, [name, brand_id, year, difficulty_level, image_url, id]);

        const [updatedModel] = await executeQuery(`
            SELECT 
                m.*,
                b.name as brand_name
            FROM models m
            INNER JOIN brands b ON m.brand_id = b.id
            WHERE m.id = ?
        `, [id]);

        logger.info('Model updated:', { id, name, brand_id });

        res.json({
            success: true,
            data: updatedModel,
            message: 'Modèle modifié avec succès'
        });
    } catch (error) {
        logger.error('Error updating model:', error);
        res.status(500).json({
            success: false,
            error: