const express = require('express');
const router = express.Router();
const { generateLearningMap } = require('../controllers/mapController');

/**
 * POST /api/generate-map
 * Generates a learning map for the given topic
 * Body: { topic: string }
 */
router.post('/generate-map', generateLearningMap);

module.exports = router;

