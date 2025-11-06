# Learning Map Generator

An AI-powered web application that generates interactive, visual learning maps for any topic using OpenAI's GPT models. Transform any subject into a structured learning path with connected nodes showing prerequisites and dependencies.

## 🎯 What is This Project?

The Learning Map Generator is a full-stack web application that:

- Takes any topic as input (e.g., "Machine Learning", "React Development", "Quantum Physics")
- Uses AI to generate a comprehensive, structured learning map
- Visualizes the learning path as an interactive graph with nodes and connections
- Provides detailed descriptions for each learning concept

Perfect for students, educators, and anyone looking to create structured learning paths for complex topics.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **React Flow** - Interactive graph visualization library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **OpenAI API** - GPT-4/GPT-3.5 for AI-powered content generation

## 📁 Project Structure

```
learning-map-generator/
├── backend/
│   ├── server.js              # Express server setup
│   ├── routes/
│   │   └── generateMap.js     # API routes
│   ├── controllers/
│   │   └── mapController.js   # Request handlers
│   ├── services/
│   │   └── llmService.js      # OpenAI integration
│   ├── package.json
│   └── env.example            # Environment variables template
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── TopicInput.tsx     # Topic input form
│   │   ├── LearningMap.tsx    # React Flow visualization
│   │   └── NodeDetails.tsx    # Node details sidebar
│   ├── utils/
│   │   └── types.ts           # TypeScript type definitions
│   └── package.json
└── README.md
```

## 🛠️ How to Run

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `env.example`):
```bash
cp env.example .env
```

4. Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
PORT=3001
```

5. Start the server:
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

4. For production build:
```bash
npm run build
npm start
```

## 🤖 How AI Map Generation Works

The application uses OpenAI's GPT models to generate structured learning maps through the following process:

1. **User Input**: User enters a topic via the frontend
2. **API Request**: Frontend sends POST request to `/api/generate-map` with the topic
3. **AI Processing**: Backend sends a structured prompt to OpenAI API requesting:
   - Main topic identification
   - Subtopics breakdown (3-8 subtopics)
   - Learning nodes (8-15 concepts with descriptions)
   - Edges/connections showing prerequisites and learning dependencies
4. **JSON Response**: OpenAI returns structured JSON with nodes and edges
5. **Visualization**: React Flow renders the graph with:
   - Interactive nodes (clickable for details)
   - Animated edges showing connections
   - Zoom, pan, and navigation controls

### Prompt Engineering

The system prompt instructs GPT to:
- Create learning concepts (not just topics)
- Establish logical prerequisites between nodes
- Provide detailed descriptions for each concept
- Ensure all connections are valid (source/target IDs exist)

You can customize the prompt in `backend/services/llmService.js` to adjust the output format or add more requirements.

## 📡 API Endpoints

### POST `/api/generate-map`

Generates a learning map for the given topic.

**Request:**
```json
{
  "topic": "Machine Learning"
}
```

**Response:**
```json
{
  "mainTopic": "Machine Learning",
  "subtopics": ["Basics", "Algorithms", "Applications"],
  "nodes": [
    {
      "id": "node-1",
      "label": "Introduction to ML",
      "description": "Learn the fundamentals of machine learning...",
      "subtopic": "Basics"
    }
  ],
  "edges": [
    {
      "source": "node-1",
      "target": "node-2"
    }
  ]
}
```

### GET `/health`

Health check endpoint to verify the API is running.

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes | - |
| `OPENAI_MODEL` | Model to use (`gpt-4` or `gpt-3.5-turbo`) | No | `gpt-4` |
| `PORT` | Server port | No | `3001` |

### Frontend Configuration

The API URL is configured in `frontend/app/page.tsx`. Update it if your backend runs on a different host or port:

```typescript
const response = await fetch('http://localhost:3001/api/generate-map', {
  // ...
});
```

## 🚢 How to Deploy

### Backend Deployment

1. **Environment Variables**: Set `OPENAI_API_KEY` and other vars in your hosting platform
2. **Popular Options**:
   - **Vercel**: Add `vercel.json` and deploy
   - **Heroku**: Use Heroku config vars
   - **Railway**: Set environment variables in dashboard
   - **AWS/DigitalOcean**: Use PM2 or similar process manager

### Frontend Deployment

1. **Build the application**:
```bash
cd frontend
npm run build
```

2. **Update API URL**: Change the backend URL in `app/page.tsx` to your production API URL

3. **Deploy Options**:
   - **Vercel** (Recommended for Next.js): Connect your GitHub repo
   - **Netlify**: Deploy from build folder
   - **AWS Amplify**: Connect GitHub and deploy

### Full-Stack Deployment (Vercel)

1. Deploy backend as a Vercel serverless function
2. Deploy frontend to Vercel
3. Update frontend API URL to point to backend Vercel URL

### Environment Variables in Production

Always store sensitive keys (like `OPENAI_API_KEY`) as environment variables in your hosting platform, never commit them to git.

## 🧪 Development

### Backend Architecture

- **server.js**: Main Express server with middleware and error handling
- **routes/**: Defines API endpoints
- **controllers/**: Handles request validation and business logic
- **services/**: External API integrations (OpenAI)

### Frontend Architecture

- **app/**: Next.js 14 App Router pages
- **components/**: Reusable React components
- **utils/**: TypeScript utilities and type definitions

### Adding Features

- **New API endpoints**: Add routes in `backend/routes/`, controllers in `backend/controllers/`
- **New components**: Add to `frontend/components/` and import in pages
- **Styling**: Use TailwindCSS classes or extend `globals.css`

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Express, and OpenAI**
