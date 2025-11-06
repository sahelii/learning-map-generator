const { callOpenAI } = require('../services/llmService');

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

    // Call OpenAI service to generate learning map
    const learningMap = await callOpenAI(topic.trim());

    res.json(learningMap);
  } catch (error) {
    console.error('Error generating learning map:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate learning map',
    });
  }
};

module.exports = {
  generateLearningMap,
};

