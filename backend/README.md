# Learning Map Generator - Backend

Express.js backend API for the Learning Map Generator.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `env.example`):
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
VALIDATE_URLS=false
PORT=3001
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/generate-map

Generates a learning map for a given topic.

**Request Body:**
```json
{
  "topic": "Machine Learning"
}
```

**Response:**
```json
{
  "mainTopic": "Machine Learning",
  "subtopics": ["..."],
  "nodes": [...],
  "edges": [...]
}
```

### POST /api/expand-node

Expands a node into 3–5 additional child topics.

**Request Body:**
```json
{
  "nodeTitle": "Caching Strategies"
}
```

### POST /api/related-topics

Returns 4–6 topics closely related to the requested subject.

**Request Body:**
```json
{
  "topic": "System Design"
}
```

## Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key (required)
- `GEMINI_MODEL`: Model to use (default: `gemini-1.5-flash`)
- `GEMINI_API_BASE_URL`: Gemini API base URL (default: `https://generativelanguage.googleapis.com/v1beta`)
- `VALIDATE_URLS`: Set to `true` to run HEAD checks against returned resource links (default: `false`)
- `PORT`: Server port (default: `3001`)

