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

const allowedLevels = new Set(['Beginner', 'Intermediate', 'Advanced']);

const sanitizeLevel = (level) => {
  if (typeof level !== 'string') {
    return undefined;
  }
  const normalized = level.trim();
  if (allowedLevels.has(normalized)) {
    return normalized;
  }
  return undefined;
};

const normalizeNode = (node) => {
  if (!node || typeof node !== 'object') {
    return node;
  }

  return {
    ...node,
    level: sanitizeLevel(node.level),
    resources: sanitizeResources(node.resources),
  };
};

const shouldValidateUrls = String(process.env.VALIDATE_URLS || 'false').toLowerCase() === 'true';
const urlCache = new Map();

const checkUrl = async (url) => {
  if (urlCache.has(url)) {
    return urlCache.get(url);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const ok = response.ok;
    urlCache.set(url, ok);
    return ok;
  } catch (error) {
    urlCache.set(url, false);
    return false;
  }
};

const validateNodeList = async (nodes) => {
  if (!shouldValidateUrls) {
    return nodes;
  }

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return nodes;
  }

  const results = await Promise.all(
    nodes.map(async (node) => {
      if (!Array.isArray(node.resources) || node.resources.length === 0) {
        return node;
      }

      try {
        const checks = await Promise.allSettled(
          node.resources.map((resource) => checkUrl(resource))
        );
        const validResources = node.resources.filter((_, index) => {
          const outcome = checks[index];
          return outcome.status === 'fulfilled' && outcome.value === true;
        });

        if (validResources.length === 0) {
          return {
            ...node,
            unverified: true,
          };
        }

        return {
          ...node,
          resources: validResources,
        };
      } catch (error) {
        return {
          ...node,
          unverified: true,
        };
      }
    })
  );

  return results;
};

const runGeminiPrompt = async (prompt) => {
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

  try {
    return JSON.parse(normalizedContent);
  } catch (parseError) {
    throw new Error(
      `Gemini returned content that is not valid JSON: ${
        parseError.message
      }. Content: ${normalizedContent.slice(0, 2000)}`
    );
  }
};

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
      "level": "Beginner | Intermediate | Advanced (optional)",
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
- Whenever possible, include the level best suited for the node (Beginner, Intermediate, Advanced)
- Each node must include 2-3 relevant learning resources and each resource must be a fully-qualified URL (https://...)
- Ensure all source/target IDs in edges exist in nodes
- Make it comprehensive but focused on the topic
- Return strictly valid JSON only, no markdown, comments, or explanations.`;

  try {
    const learningMap = await runGeminiPrompt(prompt);

    const rawNodes = Array.isArray(learningMap.nodes)
      ? learningMap.nodes.map((node) => normalizeNode(node))
      : [];
    const validatedNodes = await validateNodeList(rawNodes);

    return {
      mainTopic: learningMap.mainTopic || topic,
      subtopics: learningMap.subtopics || [],
      nodes: validatedNodes,
      edges: learningMap.edges || [],
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(
      `Failed to generate learning map: ${error.message || 'Unknown error'}`
    );
  }
};

/**
 * Expands a node into additional subtopics using Gemini
 * @param {string} nodeTitle
 * @returns {Promise<{ node: string, children: Array }>}
 */
const expandNode = async (nodeTitle) => {
  const prompt = `You are assisting with building learning roadmaps.

Expand the learning topic "${nodeTitle}" into 3–5 specific, non-overlapping subtopics.

Return a JSON object shaped exactly like this:
{
  "node": "string",
  "children": [
    {
      "id": "kebab-case-unique-key",
      "label": "short, clear title",
      "description": "1-2 sentences describing the subtopic",
      "level": "Beginner | Intermediate | Advanced (optional)",
      "resources": [
        "https://trusted-resource-1",
        "https://trusted-resource-2",
        "https://trusted-resource-3"
      ]
    }
  ]
}

Rules:
- Provide between 3 and 5 child subtopics.
- Child IDs must be unique, descriptive, and in kebab-case.
- Whenever possible, provide the learning level (Beginner, Intermediate, Advanced) best suited for each child.
- Resources must be trustworthy, working URLs (no placeholders).
- Do not repeat the same resource across children.
- Return ONLY valid JSON. No markdown, no commentary, no backticks.`;

  try {
    const expansion = await runGeminiPrompt(prompt);

    const rawChildren = Array.isArray(expansion.children)
      ? expansion.children.map((child) => normalizeNode(child))
      : [];
    const validatedChildren = await validateNodeList(rawChildren);

    return {
      node: expansion.node || nodeTitle,
      children: validatedChildren,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(
      `Failed to expand node: ${error.message || 'Unknown error'}`
    );
  }
};

const getRelatedTopics = async (topic) => {
  const prompt = `You are helping a learner explore related subjects.

Suggest 4 to 6 closely related learning topics for "${topic}".
Return them as a JSON array of unique strings, ordered from most to least relevant.
Do not include explanations or numbering—just the string values.`;

  try {
    const result = await runGeminiPrompt(prompt);
    const list = Array.isArray(result) ? result : Array.isArray(result?.topics) ? result.topics : [];

    const topics = list
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const unique = [];
    const seen = new Set();
    for (const entry of topics) {
      const key = entry.toLowerCase();
      if (!seen.has(key)) {
        unique.push(entry);
        seen.add(key);
      }
    }

    return unique.slice(0, 6);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(
      `Failed to fetch related topics: ${error.message || 'Unknown error'}`
    );
  }
};

module.exports = {
  callGemini,
  expandNode,
  getRelatedTopics,
};

