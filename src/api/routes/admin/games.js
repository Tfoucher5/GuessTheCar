const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/games - Liste des parties
 */
router.get('/', async(req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            user_id = '',
            status = '',
            date_from = '',
            date_to = '',
            sortBy = 'started_at',
            sortOrder = 'desc'
        } = req.query;

        let whereClause = '';
        let params = [];
        const conditions = [];

        if (user_id) {
            conditions.push('g.user_id = ?');
            params.push(user_id);
        }

        if (status) {
            switch (status) {
            case 'completed':
                conditions.push('g.completed = 1');
                break;
            case 'abandoned':
                conditions.push('g.abandoned = 1');
                break;
            case 'timeout':
                conditions.push('g.timeout = 1');
                break;
            case 'in_progress':
                conditions.push('g.completed = 0 AND g.abandoned = 0 AND g.timeout = 0');
                break;
            }
        }

        if (date_from) {
            conditions.push('g.started_at >= ?');
            params.push(date_from);
        }

        if (date_to) {
            conditions.push('g.started_at <= ?');
            params.push(date_to + ' 23:59:59');
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const validSortFields = ['started_at', 'ended_at', 'duration_seconds', 'points_earned', 'user_id'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'started_at';
        const sortDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const query = `
            SELECT 
                g.*,
                u.username,
                CONCAT(b.name, ' ', m.name) as car_name,
                b.name as brand_name,
                m.name as model_name,
                m.difficulty_level,
                CASE 
                    WHEN g.completed = 1 THEN 'completed'
                    WHEN g.abandoned = 1 THEN 'abandoned'
                    WHEN g.timeout = 1 THEN 'timeout'
                    ELSE 'in_progress'
                END as status_label
            FROM game_sessions g
            LEFT JOIN user_scores u ON g.user_id = u.user_id
            LEFT JOIN models m ON g.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
            ${whereClause}
            ORDER BY g.${sortField} ${sortDir}
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);
        const games = await executeQuery(query, params);

        // Comptage total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM game_sessions g
            ${whereClause}
        `;
        const countParams = params.slice(0, -2);
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                games,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(total),
                    totalPages: Math.ceil(total / limit)
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
                m.image_url,
                CASE 
                    WHEN g.completed = 1 THEN 'completed'
                    WHEN g.abandoned = 1 THEN 'abandoned'
                    WHEN g.timeout = 1 THEN 'timeout'
                    ELSE 'in_progress'
                END as status_label
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

        const [game] = await executeQuery('SELECT * FROM game_sessions WHERE id = ?', [id]);
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Partie non trouvée'
            });
        }

        await executeQuery('DELETE FROM game_sessions WHERE id = ?', [id]);

        logger.info('Game session deleted:', { id, user_id: game.user_id });

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

/**
 * DELETE /api/admin/games/bulk - Suppression en masse des parties
 */
router.delete('/bulk', async(req, res) => {
    try {
        const { criteria = {} } = req.body;

        let whereClause = '';
        let params = [];
        const conditions = [];

        if (criteria.status) {
            switch (criteria.status) {
            case 'completed':
                conditions.push('completed = 1');
                break;
            case 'abandoned':
                conditions.push('abandoned = 1');
                break;
            case 'timeout':
                conditions.push('timeout = 1');
                break;
            }
        }

        if (criteria.older_than_days) {
            conditions.push('started_at < DATE_SUB(NOW(), INTERVAL ? DAY)');
            params.push(criteria.older_than_days);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const result = await executeQuery(`DELETE FROM game_sessions ${whereClause}`, params);

        logger.info('Bulk games deletion:', { criteria, deleted: result.affectedRows });

        res.json({
            success: true,
            message: `${result.affectedRows} parties supprimées avec succès`,
            deleted_count: result.affectedRows
        });
    } catch (error) {
        logger.error('Error bulk deleting games:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression en masse'
        });
    }
});

module.exports = router;
