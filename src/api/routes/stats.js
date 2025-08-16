const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Statistiques publiques', data: {} });
});

module.exports = router;
