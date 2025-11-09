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

## Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key (required)
- `GEMINI_MODEL`: Model to use (default: `gemini-1.5-flash`)
- `GEMINI_API_BASE_URL`: Gemini API base URL (default: `https://generativelanguage.googleapis.com/v1beta`)
- `PORT`: Server port (default: `3001`)

