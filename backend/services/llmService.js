/**
 * Calls Google Gemini API to generate a structured learning map
 * @param {string} topic - The main topic to create a learning map for
 * @returns {Promise<Object>} - Structured learning map with nodes and edges
 */
const callGemini = async (topic) => {
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
      "subtopic": "string (one of the subtopics)",
      "resources": [
        "string (valid URL to a learning resource)",
        "string (valid URL to a learning resource)"
      ]
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
- Each node must include 2-3 relevant learning resources and each resource must be a fully-qualified URL (https://...)
- Ensure all source/target IDs in edges exist in nodes
- Make it comprehensive but focused on the topic
- Return strictly valid JSON only, no markdown, comments, or explanations.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const rawModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = rawModel.startsWith('models/') ? rawModel : `models/${rawModel}`;
    const baseUrl =
      process.env.GEMINI_API_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta';

    const response = await fetch(
      `${baseUrl}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
          },
        }),
      }
    );

    const rawResponse = await response.text();

    if (!rawResponse || rawResponse.trim().length === 0) {
      throw new Error('Gemini API returned an empty response.');
    }

    let responseBody;
    try {
      responseBody = JSON.parse(rawResponse);
    } catch (parseError) {
      throw new Error(
        `Gemini API returned non-JSON response: ${
          parseError.message
        }. Raw response: ${rawResponse.slice(0, 2000)}`
      );
    }

    if (!response.ok) {
      const message =
        responseBody?.error?.message ||
        responseBody?.error ||
        `Gemini API request failed with status ${response.status}`;
      throw new Error(message);
    }

    const content =
      responseBody?.candidates?.[0]?.content?.parts?.[0]?.text ||
      responseBody?.candidates?.[0]?.output;

    if (!content || typeof content !== 'string') {
      throw new Error('Gemini returned an unexpected response format.');
    }

    const normalizedContent = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (normalizedContent.length === 0) {
      throw new Error('Gemini returned empty content after removing code fences.');
    }

    let learningMap;
    try {
      learningMap = JSON.parse(normalizedContent);
    } catch (parseError) {
      throw new Error(
        `Gemini returned content that is not valid JSON: ${
          parseError.message
        }. Content: ${normalizedContent.slice(0, 2000)}`
      );
    }

    // Validate and structure the response
    const sanitizeResources = (resources) => {
      if (!Array.isArray(resources)) {
        return [];
      }

      return resources
        .filter(
          (resource) => typeof resource === 'string' && resource.trim().length > 0
        )
        .map((resource) => resource.trim());
    };

    return {
      mainTopic: learningMap.mainTopic || topic,
      subtopics: learningMap.subtopics || [],
      nodes: Array.isArray(learningMap.nodes)
        ? learningMap.nodes.map((node) => ({
            ...node,
            resources: sanitizeResources(node.resources),
          }))
        : [],
      edges: learningMap.edges || [],
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(
      `Failed to generate learning map: ${error.message || 'Unknown error'}`
    );
  }
};

module.exports = {
  callGemini,
};

