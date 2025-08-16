// src/api/routes/admin/brands.js
const express = require('express');
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

/**
 * GET /api/admin/brands - Liste des marques
 */
router.get('/', async(req, res) => {
    try {
        const { page = 1, limit = 20, search = '', country = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                b.*,
                COUNT(m.id) as models_count
            FROM brands b
            LEFT JOIN models m ON b.id = m.brand_id
        `;

        let params = [];
        const whereConditions = [];

        if (search) {
            whereConditions.push('b.name LIKE ?');
            params.push(`%${search}%`);
        }

        if (country) {
            whereConditions.push('b.country = ?');
            params.push(country);
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        query += ' GROUP BY b.id ORDER BY b.name LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const brands = await executeQuery(query, params);

        // Compter le total
        let countQuery = 'SELECT COUNT(*) as total FROM brands b';
        let countParams = [];

        if (whereConditions.length > 0) {
            countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            countParams = params.slice(0, -2); // Enlever limit et offset
        }

        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                brands,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
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
 * GET /api/admin/brands/countries - Liste des pays
 */
router.get('/countries', async(req, res) => {
    try {
        const countries = await executeQuery(`
            SELECT DISTINCT country, COUNT(*) as count
            FROM brands 
            WHERE country IS NOT NULL AND country != ''
            GROUP BY country
            ORDER BY country
        `);

        res.json({
            success: true,
            data: countries
        });
    } catch (error) {
        logger.error('Error fetching countries:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des pays'
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

        // Récupérer les modèles associés
        const models = await executeQuery(`
            SELECT id, name, year, difficulty_level, image_url
            FROM models
            WHERE brand_id = ?
            ORDER BY name
        `, [id]);

        res.json({
            success: true,
            data: {
                brand,
                models
            }
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
        const { name, country = 'Inconnu' } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Le nom de la marque est requis'
            });
        }

        if (name.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Le nom ne peut pas dépasser 50 caractères'
            });
        }

        // Vérifier si la marque existe déjà
        const [existing] = await executeQuery('SELECT id FROM brands WHERE name = ?', [name.trim()]);
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Cette marque existe déjà'
            });
        }

        // Créer la marque
        await executeQuery(
            'INSERT INTO brands (name, country) VALUES (?, ?)',
            [name.trim(), country.trim()]
        );

        const [newBrand] = await executeQuery('SELECT * FROM brands WHERE name = ?', [name.trim()]);

        logger.info('Brand created:', { name, country });

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

        // Vérifier que la marque existe
        const [existing] = await executeQuery('SELECT id FROM brands WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Préparer les champs à mettre à jour
        const updateFields = [];
        const updateValues = [];

        if (name !== undefined) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Le nom de la marque ne peut pas être vide'
                });
            }
            if (name.length > 50) {
                return res.status(400).json({
                    success: false,
                    error: 'Le nom ne peut pas dépasser 50 caractères'
                });
            }
            updateFields.push('name = ?');
            updateValues.push(name.trim());
        }

        if (country !== undefined) {
            updateFields.push('country = ?');
            updateValues.push(country.trim() || 'Inconnu');
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aucun champ à mettre à jour'
            });
        }

        updateValues.push(id);

        // Exécuter la mise à jour
        await executeQuery(
            `UPDATE brands SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // Récupérer la marque mise à jour
        const [updatedBrand] = await executeQuery('SELECT * FROM brands WHERE id = ?', [id]);

        logger.info('Brand updated:', { id, updatedFields: updateFields });

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

        // Vérifier que la marque existe
        const [existing] = await executeQuery('SELECT id FROM brands WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Marque non trouvée'
            });
        }

        // Vérifier s'il y a des modèles associés
        const [modelCount] = await executeQuery('SELECT COUNT(*) as count FROM models WHERE brand_id = ?', [id]);
        if (modelCount.count > 0) {
            return res.status(400).json({
                success: false,
                error: `Impossible de supprimer la marque: ${modelCount.count} modèle(s) associé(s)`
            });
        }

        // Supprimer la marque
        await executeQuery('DELETE FROM brands WHERE id = ?', [id]);

        logger.info('Brand deleted:', { id });

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
