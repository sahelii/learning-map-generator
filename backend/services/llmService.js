const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calls OpenAI API to generate a structured learning map
 * @param {string} topic - The main topic to create a learning map for
 * @returns {Promise<Object>} - Structured learning map with nodes and edges
 */
const callOpenAI = async (topic) => {
  const prompt = `You are an expert educational content creator. Generate a comprehensive learning map for the topic: "${topic}".

Create a structured learning path with:
1. Main topic
2. Key subtopics (3-8 subtopics)
3. Learning nodes (concepts, skills, or knowledge points)
4. Connections between nodes (edges) showing prerequisites and dependencies

Return a JSON object with this exact structure:
{
  "mainTopic": "string",
  "subtopics": ["string"],
  "nodes": [
    {
      "id": "string (unique identifier)",
      "label": "string (short title)",
      "description": "string (detailed explanation)",
      "subtopic": "string (one of the subtopics)"
    }
  ],
  "edges": [
    {
      "source": "string (node id)",
      "target": "string (node id)"
    }
  ]
}

Requirements:
- Nodes should be learning concepts, not just topics
- Edges should show logical learning progression (prerequisites)
- Include 8-15 nodes total
- Each node should have a clear, educational description
- Ensure all source/target IDs in edges exist in nodes
- Make it comprehensive but focused on the topic

Return ONLY valid JSON, no markdown formatting or additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert educational content creator. Always return valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const learningMap = JSON.parse(content);

    // Validate and structure the response
    return {
      mainTopic: learningMap.mainTopic || topic,
      subtopics: learningMap.subtopics || [],
      nodes: learningMap.nodes || [],
      edges: learningMap.edges || [],
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(
      `Failed to generate learning map: ${error.message || 'Unknown error'}`
    );
  }
};

module.exports = {
  callOpenAI,
};

