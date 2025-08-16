const express = require('express');
const router = express.Router();

router.get('/stats', async(req, res) => {
    res.json({ success: true, data: { cache_stats: {} } });
});

router.delete('/clear', async(req, res) => {
    res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;
