const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * GET /api/admin/players - Liste des joueurs
 */
router.get('/', async(req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search = '',
            sortBy = 'total_points',
            sortOrder = 'desc'
        } = req.query;

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE username LIKE ? OR user_id LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        const validSortFields = ['username', 'total_points', 'games_played', 'games_won', 'created_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'total_points';
        const sortDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const query = `
            SELECT 
                *,
                CASE 
                    WHEN games_played > 0 
                    THEN ROUND((games_won / games_played) * 100, 1)
                    ELSE 0 
                END as win_rate
            FROM user_scores
            ${whereClause}
            ORDER BY ${sortField} ${sortDir}
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);
        const players = await executeQuery(query, params);

        // Comptage total
        const countQuery = `SELECT COUNT(*) as total FROM user_scores ${whereClause}`;
        const countParams = whereClause ? params.slice(0, -2) : [];
        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                players,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(total),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching players:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des joueurs'
        });
    }
});

/**
 * GET /api/admin/players/:userId - Détails d'un joueur
 */
router.get('/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const [player] = await executeQuery(`
            SELECT 
                *,
                CASE 
                    WHEN games_played > 0 
                    THEN ROUND((games_won / games_played) * 100, 1)
                    ELSE 0 
                END as win_rate
            FROM user_scores 
            WHERE user_id = ?
        `, [userId]);

        if (!player) {
            return res.status(404).json({
                success: false,
                error: 'Joueur non trouvé'
            });
        }

        // Récupérer les dernières parties
        const recentGames = await executeQuery(`
            SELECT 
                g.*,
                CONCAT(b.name, ' ', m.name) as car_name
            FROM game_sessions g
            LEFT JOIN models m ON g.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
            WHERE g.user_id = ?
            ORDER BY g.started_at DESC
            LIMIT 10
        `, [userId]);

        res.json({
            success: true,
            data: {
                player,
                recentGames
            }
        });
    } catch (error) {
        logger.error('Error fetching player:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement du joueur'
        });
    }
});

/**
 * POST /api/admin/players - Créer un nouveau joueur
 */
router.post('/', async(req, res) => {
    try {
        const { user_id, username } = req.body;

        // Validation
        if (!user_id || !username) {
            return res.status(400).json({
                success: false,
                error: 'L\'ID utilisateur et le nom sont requis'
            });
        }

        // Vérifier si le joueur existe déjà
        const [existing] = await executeQuery('SELECT user_id FROM user_scores WHERE user_id = ?', [user_id]);
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Ce joueur existe déjà'
            });
        }

        // Créer le joueur
        await executeQuery(
            'INSERT INTO user_scores (user_id, username) VALUES (?, ?)',
            [user_id, username]
        );

        const [newPlayer] = await executeQuery('SELECT * FROM user_scores WHERE user_id = ?', [user_id]);

        logger.info('Player created:', { user_id, username });

        res.status(201).json({
            success: true,
            data: newPlayer,
            message: 'Joueur créé avec succès'
        });
    } catch (error) {
        logger.error('Error creating player:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création du joueur'
        });
    }
});

/**
 * PUT /api/admin/players/:userId - Modifier un joueur
 */
router.put('/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        const { username, total_points, games_played, games_won } = req.body;

        // Vérifier que le joueur existe
        const [existing] = await executeQuery('SELECT user_id FROM user_scores WHERE user_id = ?', [userId]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Joueur non trouvé'
            });
        }

        // Construire la requête de mise à jour
        const updates = [];
        const params = [];

        if (username !== undefined) {
            updates.push('username = ?');
            params.push(username);
        }
        if (total_points !== undefined) {
            updates.push('total_points = ?');
            params.push(total_points);
        }
        if (games_played !== undefined) {
            updates.push('games_played = ?');
            params.push(games_played);
        }
        if (games_won !== undefined) {
            updates.push('games_won = ?');
            params.push(games_won);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aucune donnée à mettre à jour'
            });
        }

        params.push(userId);

        await executeQuery(
            `UPDATE user_scores SET ${updates.join(', ')} WHERE user_id = ?`,
            params
        );

        const [updatedPlayer] = await executeQuery('SELECT * FROM user_scores WHERE user_id = ?', [userId]);

        logger.info('Player updated:', { userId, updates: Object.keys(req.body) });

        res.json({
            success: true,
            data: updatedPlayer,
            message: 'Joueur modifié avec succès'
        });
    } catch (error) {
        logger.error('Error updating player:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification du joueur'
        });
    }
});

/**
 * POST /api/admin/players/:userId/reset - Reset des stats d'un joueur
 */
router.post('/:userId/reset', async(req, res) => {
    try {
        const { userId } = req.params;

        const [player] = await executeQuery('SELECT * FROM user_scores WHERE user_id = ?', [userId]);
        if (!player) {
            return res.status(404).json({
                success: false,
                error: 'Joueur non trouvé'
            });
        }

        await executeQuery(`
            UPDATE user_scores 
            SET 
                total_points = 0,
                total_difficulty_points = 0,
                games_played = 0,
                games_won = 0,
                correct_brand_guesses = 0,
                correct_model_guesses = 0,
                total_brand_guesses = 0,
                total_model_guesses = 0,
                best_streak = 0,
                current_streak = 0,
                best_time = NULL,
                average_response_time = 0
            WHERE user_id = ?
        `, [userId]);

        logger.info('Player stats reset:', { userId, username: player.username });

        res.json({
            success: true,
            message: 'Statistiques du joueur remises à zéro'
        });
    } catch (error) {
        logger.error('Error resetting player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la remise à zéro des statistiques'
        });
    }
});

/**
 * DELETE /api/admin/players/:userId - Supprimer un joueur
 */
router.delete('/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        const [player] = await executeQuery('SELECT * FROM user_scores WHERE user_id = ?', [userId]);
        if (!player) {
            return res.status(404).json({
                success: false,
                error: 'Joueur non trouvé'
            });
        }

        // Supprimer d'abord les sessions de jeu
        await executeQuery('DELETE FROM game_sessions WHERE user_id = ?', [userId]);

        // Puis supprimer le joueur
        await executeQuery('DELETE FROM user_scores WHERE user_id = ?', [userId]);

        logger.info('Player deleted:', { userId, username: player.username });

        res.json({
            success: true,
            message: 'Joueur supprimé avec succès'
        });
    } catch (error) {
        logger.error('Error deleting player:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du joueur'
        });
    }
});

module.exports = router;
