const express = require('express');
const router = express.Router();

// Route stub pour les backups - sera implémentée plus tard
router.get('/', async(req, res) => {
    res.json({
        success: true,
        message: 'Module backup en cours de développement',
        data: {
            backups: [],
            lastBackup: null,
            nextScheduled: null
        }
    });
});

router.post('/', async(req, res) => {
    res.json({
        success: true,
        message: 'Fonction de backup en cours de développement'
    });
});

module.exports = router;
