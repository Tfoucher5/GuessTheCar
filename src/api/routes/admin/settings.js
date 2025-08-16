// src/api/routes/admin/settings.js
const express = require('express');
const router = express.Router();

router.get('/', async(req, res) => {
    res.json({
        success: true,
        data: {
            settings: {
                gameTimeout: 300,
                maxAttempts: 5,
                difficultyLevels: ['Facile', 'Moyen', 'Difficile']
            }
        }
    });
});

router.put('/', async(req, res) => {
    res.json({
        success: true,
        message: 'Paramètres mis à jour avec succès'
    });
});

module.exports = router;
