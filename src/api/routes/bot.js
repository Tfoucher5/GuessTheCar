// src/api/routes/bot.js
// Minimal bot API routes

const express = require('express');
const router = express.Router();

console.log('✅ bot.js routes loaded');

// GET /api/bot/ping - Simple health check
router.get('/ping', (req, res) => {
    res.json({
        success: true,
        message: 'pong',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
