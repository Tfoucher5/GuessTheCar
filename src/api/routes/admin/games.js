const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/games - Liste des sessions de jeu avec pagination
 */
router.get('/', async(req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search = '',
            status = '',
            difficulty = '',
            user_id = '',
            sortBy = 'started_at',
            sortOrder = 'desc'
        } = req.query;

        // Construction de la requête
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search) {
            whereClause += ' AND (us.username LIKE ? OR CONCAT(b.name, " ", m.name) LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            if (status === 'completed') {
                whereClause += ' AND gs.ended_at IS NOT NULL';
            } else if (status === 'active') {
                whereClause += ' AND gs.ended_at IS NULL';
            }
        }

        if (difficulty) {
            whereClause += ' AND m.difficulty_level = ?';
            params.push(parseInt(difficulty));
        }

        if (user_id) {
            whereClause += ' AND gs.user_id = ?';
            params.push(user_id);
        }

        const validSortFields = ['started_at', 'ended_at', 'username', 'difficulty_level', 'status'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'started_at';
        const sortDir = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        let sortColumn = 'gs.started_at';
        if (sortField === 'username') sortColumn = 'us.username';
        else if (sortField === 'difficulty_level') sortColumn = 'm.difficulty_level';
        else if (sortField === 'ended_at') sortColumn = 'gs.ended_at';
        else if (sortField === 'status') sortColumn = 'CASE WHEN gs.ended_at IS NULL THEN 0 ELSE 1 END';

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const query = `
            SELECT 
                gs.id,
                gs.user_id,
                gs.started_at,
                gs.ended_at,
                CASE WHEN gs.ended_at IS NULL THEN 'En cours' ELSE 'Terminée' END as status,
                us.username,
                m.id as model_id,
                m.name as model_name,
                m.difficulty_level,
                m.year,
                b.name as brand_name,
                CONCAT(b.name, ' ', m.name) as full_car_name,
                TIMESTAMPDIFF(SECOND, gs.started_at, COALESCE(gs.ended_at, NOW())) as duration_seconds
            FROM game_sessions gs
            LEFT JOIN user_scores us ON gs.user_id = us.user_id
            LEFT JOIN models m ON gs.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
            ${whereClause}
            ORDER BY ${sortColumn} ${sortDir}
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);
        const games = await executeQuery(query, params);

        // Comptage total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM game_sessions gs
            LEFT JOIN user_scores us ON gs.user_id = us.user_id
            LEFT JOIN models m ON gs.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
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
                gs.*,
                us.username,
                m.id as model_id,
                m.name as model_name,
                m.difficulty_level,
                m.year,
                m.image_url,
                b.name as brand_name,
                CONCAT(b.name, ' ', m.name) as full_car_name,
                TIMESTAMPDIFF(SECOND, gs.started_at, COALESCE(gs.ended_at, NOW())) as duration_seconds
            FROM game_sessions gs
            LEFT JOIN user_scores us ON gs.user_id = us.user_id
            LEFT JOIN models m ON gs.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
            WHERE gs.id = ?
        `, [id]);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Partie non trouvée'
            });
        }

        // Récupérer les tentatives de cette partie si elles existent
        const attempts = await executeQuery(`
            SELECT 
                id,
                guess_text,
                guess_type,
                is_correct,
                points_earned,
                created_at
            FROM game_attempts 
            WHERE session_id = ?
            ORDER BY created_at ASC
        `, [id]).catch(() => []); // Si la table n'existe pas encore

        game.attempts = attempts;
        game.status = game.ended_at ? 'Terminée' : 'En cours';

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

        // Vérifier que la partie existe
        const [existing] = await executeQuery(
            'SELECT id, user_id FROM game_sessions WHERE id = ?',
            [id]
        );

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Partie non trouvée'
            });
        }

        // Supprimer les tentatives associées (si la table existe)
        try {
            await executeQuery('DELETE FROM game_attempts WHERE session_id = ?', [id]);
        } catch (error) {
            // La table game_attempts n'existe peut-être pas encore
            logger.warn('Could not delete game attempts:', error.message);
        }

        // Supprimer la partie
        await executeQuery('DELETE FROM game_sessions WHERE id = ?', [id]);

        logger.info('Game session deleted via admin:', {
            gameId: id,
            userId: existing.user_id
        });

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
 * POST /api/admin/games/:id/end - Terminer une partie en cours
 */
router.post('/:id/end', async(req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que la partie existe et est en cours
        const [existing] = await executeQuery(
            'SELECT id, user_id, ended_at FROM game_sessions WHERE id = ?',
            [id]
        );

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Partie non trouvée'
            });
        }

        if (existing.ended_at) {
            return res.status(400).json({
                success: false,
                error: 'Cette partie est déjà terminée'
            });
        }

        // Terminer la partie
        await executeQuery(
            'UPDATE game_sessions SET ended_at = NOW() WHERE id = ?',
            [id]
        );

        logger.info('Game session ended via admin:', {
            gameId: id,
            userId: existing.user_id
        });

        res.json({
            success: true,
            message: 'Partie terminée avec succès'
        });
    } catch (error) {
        logger.error('Error ending game:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la fin de partie'
        });
    }
});

/**
 * GET /api/admin/games/stats/summary - Statistiques des parties
 */
router.get('/stats/summary', async(req, res) => {
    try {
        const stats = await Promise.all([
            // Total des parties
            executeQuery('SELECT COUNT(*) as total FROM game_sessions'),

            // Parties en cours
            executeQuery('SELECT COUNT(*) as active FROM game_sessions WHERE ended_at IS NULL'),

            // Parties terminées
            executeQuery('SELECT COUNT(*) as completed FROM game_sessions WHERE ended_at IS NOT NULL'),

            // Durée moyenne des parties terminées
            executeQuery(`
                SELECT AVG(TIMESTAMPDIFF(SECOND, started_at, ended_at)) as avg_duration
                FROM game_sessions 
                WHERE ended_at IS NOT NULL
            `),

            // Parties par difficulté
            executeQuery(`
                SELECT 
                    m.difficulty_level,
                    COUNT(*) as count
                FROM game_sessions gs
                LEFT JOIN models m ON gs.car_id = m.id
                WHERE m.difficulty_level IS NOT NULL
                GROUP BY m.difficulty_level
                ORDER BY m.difficulty_level
            `)
        ]);

        res.json({
            success: true,
            data: {
                total: stats[0][0].total,
                active: stats[1][0].active,
                completed: stats[2][0].completed,
                avgDuration: Math.round(stats[3][0].avg_duration || 0),
                byDifficulty: stats[4]
            }
        });
    } catch (error) {
        logger.error('Error fetching game stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des statistiques'
        });
    }
});

module.exports = router;
