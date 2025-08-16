const express = require('express');
const router = express.Router();

// Route stub pour les paramètres - sera implémentée plus tard
router.get('/', async(req, res) => {
    res.json({
        success: true,
        data: {
            game: {
                maxAttempts: 5,
                timeLimit: 300,
                pointsPerCorrectAnswer: 10
            },
            bot: {
                prefix: '!',
                language: 'fr',
                timezone: 'Europe/Paris'
            },
            admin: {
                logLevel: 'info',
                autoBackup: false,
                maintenanceMode: false
            }
        }
    });
});

router.put('/', async(req, res) => {
    res.json({
        success: true,
        message: 'Fonction de mise à jour des paramètres en cours de développement'
    });
});

module.exports = router;
