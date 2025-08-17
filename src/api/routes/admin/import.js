const express = require('express');
const router = express.Router();

router.post('/:table', async(req, res) => {
    res.json({ success: true, data: { message: 'Import endpoint' } });
});

module.exports = router;
