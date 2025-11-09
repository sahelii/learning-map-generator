const express = require('express');
const router = express.Router();
const {
  generateLearningMap,
  expandLearningNode,
} = require('../controllers/mapController');

/**
 * POST /api/generate-map
 * Generates a learning map for the given topic
 * Body: { topic: string }
 */
router.post('/generate-map', generateLearningMap);

/**
 * POST /api/expand-node
 * Expands a learning node into subtopics
 * Body: { nodeTitle: string }
 */
router.post('/expand-node', expandLearningNode);

module.exports = router;

