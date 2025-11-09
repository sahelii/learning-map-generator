# Learning Map Generator - Frontend

Next.js 14 frontend application for the Learning Map Generator.

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure the backend API location by creating `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Quality

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint (non-interactive)
```

## Project Structure

- `app/`: Next.js App Router pages
- `components/`: React components
  - `TopicInput.tsx`: Topic input form
  - `LearningLevelFilter.tsx`: Difficulty filter chips (All/Beginner/Intermediate/Advanced)
  - `LearningMap.tsx`: React Flow visualization with expand/collapse controls
  - `NodeDetails.tsx`: Sidebar for node details and resources
- `utils/`: Shared helpers (`types.ts`, `api.ts`)

## Key UI Features

- Difficulty filter chips update the map in-place without extra API calls
- Related topic suggestions appear after each generation; clicking regenerates instantly
- Nodes support expand/collapse with cached subtree reuse and animated entrance
- Auto-save to localStorage with a “Resume previous map” banner, plus JSON import/export buttons
- Resource drawer indicates when links are unverified (optional backend HEAD checks)

## Configuration

All API calls go through `utils/api.ts`, which reads `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3001`). Update that environment variable when deploying the backend elsewhere.

