// src/api/routes/admin/games.js
const express = require('express');
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

/**
 * GET /api/admin/games - Liste des sessions de jeu
 */
router.get('/', async(req, res) => {
    try {
        const { page = 1, limit = 20, user_id = '', completed = '', difficulty = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                g.*,
                u.username,
                CONCAT(b.name, ' ', m.name) as car_name,
                b.name as brand_name,
                m.name as model_name,
                m.difficulty_level
            FROM game_sessions g
            LEFT JOIN user_scores u ON g.user_id = u.user_id
            LEFT JOIN models m ON g.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
        `;

        let params = [];
        const whereConditions = [];

        if (user_id) {
            whereConditions.push('g.user_id = ?');
            params.push(user_id);
        }

        if (completed !== '') {
            whereConditions.push('g.completed = ?');
            params.push(completed === 'true' ? 1 : 0);
        }

        if (difficulty) {
            whereConditions.push('m.difficulty_level = ?');
            params.push(parseInt(difficulty));
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        query += ' ORDER BY g.started_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const games = await executeQuery(query, params);

        // Compter le total
        let countQuery = 'SELECT COUNT(*) as total FROM game_sessions g LEFT JOIN models m ON g.car_id = m.id';
        let countParams = [];

        if (whereConditions.length > 0) {
            countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            countParams = params.slice(0, -2);
        }

        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                games,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching games:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des parties'
        });
    }
});

/**
 * GET /api/admin/games/:id - Détails d'une partie
 */
router.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const [game] = await executeQuery(`
            SELECT 
                g.*,
                u.username,
                CONCAT(b.name, ' ', m.name) as car_name,
                b.name as brand_name,
                m.name as model_name,
                m.difficulty_level,
                m.image_url
            FROM game_sessions g
            LEFT JOIN user_scores u ON g.user_id = u.user_id
            LEFT JOIN models m ON g.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
            WHERE g.id = ?
        `, [id]);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Partie non trouvée'
            });
        }

        res.json({
            success: true,
            data: game
        });
    } catch (error) {
        logger.error('Error fetching game:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement de la partie'
        });
    }
});

/**
 * DELETE /api/admin/games/:id - Supprimer une partie
 */
router.delete('/:id', async(req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await executeQuery('SELECT id FROM game_sessions WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Partie non trouvée'
            });
        }

        await executeQuery('DELETE FROM game_sessions WHERE id = ?', [id]);

        logger.info('Game session deleted:', { id });

        res.json({
            success: true,
            message: 'Partie supprimée avec succès'
        });
    } catch (error) {
        logger.error('Error deleting game:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la partie'
        });
    }
});

module.exports = router;
