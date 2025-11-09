const { callGemini, expandNode, getRelatedTopics } = require('../services/llmService');

/**
 * Controller to handle learning map generation requests
 */
const generateLearningMap = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        error: 'Topic is required and must be a non-empty string',
      });
    }

    const trimmedTopic = topic.trim();

    if (trimmedTopic.length === 0 || trimmedTopic.length > 120) {
      return res.status(400).json({
        error: 'Topic must be between 1 and 120 characters',
      });
    }

    const learningMap = await callGemini(trimmedTopic);

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

    if (!nodeTitle || typeof nodeTitle !== 'string') {
      return res.status(400).json({
        error: 'nodeTitle is required and must be a non-empty string',
      });
    }

    const trimmedTitle = nodeTitle.trim();

    if (trimmedTitle.length === 0 || trimmedTitle.length > 120) {
      return res.status(400).json({
        error: 'nodeTitle must be between 1 and 120 characters',
      });
    }

    const expansion = await expandNode(trimmedTitle);

    res.json(expansion);
  } catch (error) {
    console.error('Error expanding learning node:', error);
    res.status(500).json({
      error: error.message || 'Failed to expand learning node',
    });
  }
};

const getRelatedTopicsController = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        error: 'Topic is required and must be a non-empty string',
      });
    }

    const trimmedTopic = topic.trim();

    if (trimmedTopic.length === 0 || trimmedTopic.length > 120) {
      return res.status(400).json({
        error: 'Topic must be between 1 and 120 characters',
      });
    }

    const topics = await getRelatedTopics(trimmedTopic);

    res.json({ topics });
  } catch (error) {
    console.error('Error fetching related topics:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch related topics',
    });
  }
};

module.exports = {
  generateLearningMap,
  expandLearningNode,
  getRelatedTopicsController,
};

