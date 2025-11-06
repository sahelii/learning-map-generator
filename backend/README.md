# Learning Map Generator - Backend

Express.js backend API for the Learning Map Generator.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `env.example`):
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
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

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: Model to use (default: `gpt-4`)
- `PORT`: Server port (default: `3001`)

