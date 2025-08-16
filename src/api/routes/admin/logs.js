const express = require('express');
const router = express.Router();

// Route stub pour les logs - sera implémentée plus tard
router.get('/', async(req, res) => {
    res.json({
        success: true,
        message: 'Module logs en cours de développement',
        data: {
            logs: [],
            pagination: {
                page: 1,
                limit: 50,
                total: 0,
                totalPages: 0
            }
        }
    });
});

module.exports = router;
