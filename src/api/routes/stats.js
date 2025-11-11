const express = require('express');
const router = express.Router();

let stats = {
    totalGames: 0,
    wins: 0,
    losses: 0
};

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Statistiques publiques', data: {} });
});

router.post('/reset', (req, res) => {
    stats = { totalGames: 0, wins: 0, losses: 0 };
    res.json({ success: true, stats });
});

module.exports = router;
