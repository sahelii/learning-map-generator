const { callGemini, expandNode } = require('../services/llmService');

/**
 * Controller to handle learning map generation requests
 */
const generateLearningMap = async (req, res) => {
  try {
    const { topic } = req.body;

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        error: 'Topic is required and must be a non-empty string',
      });
    }

    // Call LLM service to generate learning map
    const learningMap = await callGemini(topic.trim());

    res.json(learningMap);
  } catch (error) {
    console.error('Error generating learning map:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate learning map',
    });
  }
};

const expandLearningNode = async (req, res) => {
  try {
    const { nodeTitle } = req.body;

    if (!nodeTitle || typeof nodeTitle !== 'string' || nodeTitle.trim().length === 0) {
      return res.status(400).json({
        error: 'nodeTitle is required and must be a non-empty string',
      });
    }

    const expansion = await expandNode(nodeTitle.trim());

    res.json(expansion);
  } catch (error) {
    console.error('Error expanding learning node:', error);
    res.status(500).json({
      error: error.message || 'Failed to expand learning node',
    });
  }
};

module.exports = {
  generateLearningMap,
  expandLearningNode,
};

