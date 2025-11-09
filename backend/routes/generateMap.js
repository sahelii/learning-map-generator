const express = require('express');
const router = express.Router();
const {
  generateLearningMap,
  expandLearningNode,
  getRelatedTopicsController,
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

/**
 * POST /api/related-topics
 * Suggest related topics for the current map
 * Body: { topic: string }
 */
router.post('/related-topics', getRelatedTopicsController);

module.exports = router;

