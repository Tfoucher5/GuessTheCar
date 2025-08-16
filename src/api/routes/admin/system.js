const express = require('express');
const router = express.Router();

router.get('/info', async(req, res) => {
    res.json({
        success: true,
        data: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        }
    });
});

module.exports = router;
