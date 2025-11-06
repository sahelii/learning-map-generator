# Learning Map Generator - Frontend

Next.js 14 frontend application for the Learning Map Generator.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

- `app/`: Next.js App Router pages
- `components/`: React components
  - `TopicInput.tsx`: Input form for topic
  - `LearningMap.tsx`: React Flow visualization
  - `NodeDetails.tsx`: Sidebar for node details
- `utils/`: TypeScript type definitions

## Configuration

Make sure the backend API URL in `app/page.tsx` matches your backend server configuration (default: `http://localhost:3001`).

