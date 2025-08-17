// src/api/routes/admin/players.js
const express = require('express');
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

/**
 * GET /api/admin/players - Liste des joueurs
 */
router.get('/', async(req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                us.*,
                ROW_NUMBER() OVER (ORDER BY us.total_difficulty_points DESC, us.games_won DESC) as ranking,
                CASE 
                    WHEN us.total_difficulty_points >= 100 THEN 'Expert'
                    WHEN us.total_difficulty_points >= 50 THEN 'Avancé'
                    WHEN us.total_difficulty_points >= 20 THEN 'Intermédiaire'
                    ELSE 'Débutant'
                END as skill_level
            FROM user_scores us
        `;

        let params = [];

        if (search) {
            query += ' WHERE us.username LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY us.total_difficulty_points DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const players = await executeQuery(query, params);

        // Compter le total
        let countQuery = 'SELECT COUNT(*) as total FROM user_scores';
        let countParams = [];

        if (search) {
            countQuery += ' WHERE username LIKE ?';
            countParams.push(`%${search}%`);
        }

        const [{ total }] = await executeQuery(countQuery, countParams);

        res.json({
            success: true,
            data: {
                players,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
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

        // Récupérer le joueur avec son classement
        const [player] = await executeQuery(`
            SELECT 
                us.*,
                (
                    SELECT COUNT(*) + 1 
                    FROM user_scores us2 
                    WHERE us2.total_difficulty_points > us.total_difficulty_points
                    OR (us2.total_difficulty_points = us.total_difficulty_points AND us2.games_won > us.games_won)
                ) as ranking,
                CASE 
                    WHEN us.total_difficulty_points >= 100 THEN 'Expert'
                    WHEN us.total_difficulty_points >= 50 THEN 'Avancé'
                    WHEN us.total_difficulty_points >= 20 THEN 'Intermédiaire'
                    ELSE 'Débutant'
                END as skill_level,
                CASE 
                    WHEN us.total_brand_guesses > 0 THEN ROUND((us.correct_brand_guesses / us.total_brand_guesses) * 100, 1)
                    ELSE 0 
                END as success_rate
            FROM user_scores us
            WHERE us.user_id = ?
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
                CONCAT(b.name, ' ', m.name) as car_name,
                b.name as brand_name,
                m.name as model_name
            FROM game_sessions g
            LEFT JOIN models m ON g.car_id = m.id
            LEFT JOIN brands b ON m.brand_id = b.id
            WHERE g.user_id = ?
            ORDER BY g.started_at DESC
            LIMIT 10
        `, [userId]);

        // Statistiques par difficulté
        const difficultyStats = await executeQuery(`
            SELECT 
                m.difficulty_level,
                COUNT(*) as games_count,
                SUM(CASE WHEN g.completed = 1 THEN 1 ELSE 0 END) as wins_count,
                AVG(g.duration_seconds) as avg_duration,
                SUM(g.points_earned) as total_points
            FROM game_sessions g
            LEFT JOIN models m ON g.car_id = m.id
            WHERE g.user_id = ?
            GROUP BY m.difficulty_level
            ORDER BY m.difficulty_level
        `, [userId]);

        res.json({
            success: true,
            data: {
                player,
                recentGames,
                difficultyStats
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

        // Validation du format user_id (Discord ID)
        if (!/^\d{17,19}$/.test(user_id)) {
            return res.status(400).json({
                success: false,
                error: 'L\'ID utilisateur doit être un ID Discord valide'
            });
        }

        // Validation du username
        if (username.length < 1 || username.length > 32) {
            return res.status(400).json({
                success: false,
                error: 'Le nom d\'utilisateur doit faire entre 1 et 32 caractères'
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

        // Créer le joueur avec la requête correcte
        await executeQuery(`
            INSERT INTO user_scores (
                user_id, 
                username, 
                total_points, 
                total_difficulty_points, 
                games_played, 
                games_won, 
                correct_brand_guesses, 
                correct_model_guesses, 
                total_brand_guesses, 
                total_model_guesses, 
                best_streak, 
                current_streak, 
                best_time, 
                average_response_time
            ) VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0)
        `, [user_id, username]);

        // Récupérer le joueur créé
        const [newPlayer] = await executeQuery('SELECT * FROM user_scores WHERE user_id = ?', [user_id]);

        logger.info('Player created via admin:', { user_id, username });

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
        const { username, total_points, total_difficulty_points, games_played, games_won } = req.body;

        // Vérifier que le joueur existe
        const [existing] = await executeQuery('SELECT user_id FROM user_scores WHERE user_id = ?', [userId]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Joueur non trouvé'
            });
        }

        // Préparer les champs à mettre à jour
        const updateFields = [];
        const updateValues = [];

        if (username !== undefined) {
            if (username.length < 1 || username.length > 32) {
                return res.status(400).json({
                    success: false,
                    error: 'Le nom d\'utilisateur doit faire entre 1 et 32 caractères'
                });
            }
            updateFields.push('username = ?');
            updateValues.push(username);
        }

        if (total_points !== undefined) {
            updateFields.push('total_points = ?');
            updateValues.push(parseFloat(total_points) || 0);
        }

        if (total_difficulty_points !== undefined) {
            updateFields.push('total_difficulty_points = ?');
            updateValues.push(parseFloat(total_difficulty_points) || 0);
        }

        if (games_played !== undefined) {
            updateFields.push('games_played = ?');
            updateValues.push(parseInt(games_played) || 0);
        }

        if (games_won !== undefined) {
            updateFields.push('games_won = ?');
            updateValues.push(parseInt(games_won) || 0);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aucun champ à mettre à jour'
            });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(userId);

        // Exécuter la mise à jour
        await executeQuery(
            `UPDATE user_scores SET ${updateFields.join(', ')} WHERE user_id = ?`,
            updateValues
        );

        // Récupérer le joueur mis à jour
        const [updatedPlayer] = await executeQuery('SELECT * FROM user_scores WHERE user_id = ?', [userId]);

        logger.info('Player updated via admin:', { userId, updatedFields: updateFields });

        res.json({
            success: true,
            data: updatedPlayer,
            message: 'Joueur mis à jour avec succès'
        });
    } catch (error) {
        logger.error('Error updating player:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour du joueur'
        });
    }
});

/**
 * DELETE /api/admin/players/:userId - Supprimer un joueur
 */
router.delete('/:userId', async(req, res) => {
    try {
        const { userId } = req.params;

        // Vérifier que le joueur existe
        const [existing] = await executeQuery('SELECT user_id FROM user_scores WHERE user_id = ?', [userId]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Joueur non trouvé'
            });
        }

        // Supprimer d'abord les sessions de jeu associées
        await executeQuery('DELETE FROM game_sessions WHERE user_id = ?', [userId]);

        // Supprimer le joueur
        await executeQuery('DELETE FROM user_scores WHERE user_id = ?', [userId]);

        logger.info('Player deleted via admin:', { userId });

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

/**
 * POST /api/admin/players/:userId/reset-stats - Réinitialiser les stats d'un joueur
 */
router.post('/:userId/reset-stats', async(req, res) => {
    try {
        const { userId } = req.params;

        // Vérifier que le joueur existe
        const [existing] = await executeQuery('SELECT user_id, username FROM user_scores WHERE user_id = ?', [userId]);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Joueur non trouvé'
            });
        }

        // Réinitialiser les statistiques (garder username et user_id)
        await executeQuery(`
            UPDATE user_scores SET
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
                average_response_time = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `, [userId]);

        // Supprimer l'historique des parties
        await executeQuery('DELETE FROM game_sessions WHERE user_id = ?', [userId]);

        // Récupérer le joueur réinitialisé
        const [resetPlayer] = await executeQuery('SELECT * FROM user_scores WHERE user_id = ?', [userId]);

        logger.info('Player stats reset via admin:', { userId, username: existing.username });

        res.json({
            success: true,
            data: resetPlayer,
            message: 'Statistiques du joueur réinitialisées avec succès'
        });
    } catch (error) {
        logger.error('Error resetting player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la réinitialisation des statistiques'
        });
    }
});

module.exports = router;
