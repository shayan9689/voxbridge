# VoxBridge

Real-time voice and video call platform with WebRTC, room-based signaling, and an optional AI voice assistant.

## Features

- **Real-time voice & video** — WebRTC peer-to-peer calls with fallback signaling via Socket.IO
- **Room-based meetings** — Create or join rooms by code; dynamic tile layout and screen sharing
- **Optional AI assistant** — Add an OpenAI-powered voice agent to any room (requires API key)
- **User settings** — Device selection, theme (light/dark), layout density, mic/camera toggles
- **Responsive UI** — Lobby, call room, floating AI panel, and sidebar with room controls

## Tech stack

| Layer    | Stack |
|----------|--------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Socket.IO client |
| Backend  | Node.js, Express, Socket.IO |
| Real-time | WebRTC (peer connection + signaling) |
| AI       | OpenAI API (optional; GPT + TTS for voice agent) |

## Project structure

```
voice-agent-platform/
├── backend/          # Express + Socket.IO signaling server
├── frontend/         # Next.js app (lobby + call room)
├── shared/           # Shared types/constants
├── .env              # Backend env (port, CORS, OpenAI key)
└── README.md
```

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- (Optional) **OpenAI API key** for the “Add AI assistant” feature

## Setup

### 1. Install dependencies

```bash
cd voice-agent-platform
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Environment

**Backend** — Use the root `.env` (or create `backend/.env`):

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Optional: for "Add AI assistant" in a room
OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
# OPENAI_TTS_MODEL=tts-1
# OPENAI_TTS_VOICE=alloy
```

**Frontend** — Copy `frontend/.env.example` to `frontend/.env.local` and set the backend URL if needed:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Run

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

- Frontend: **http://localhost:3000**
- Backend (Socket.IO): **http://localhost:3001**

Create a room from the lobby, then open the same room URL in another tab or browser to test a call.

## Deployment

Repo root is **voxbridge**; the app is under **voice-agent-platform**. Deploy **frontend on Vercel** and **backend on Render**, then connect them with env vars.

### 1. Backend on Render (deploy first)

1. Go to [render.com](https://render.com) → **Dashboard** → **New** → **Web Service**.
2. Connect your **voxbridge** repo (GitHub).
3. **Root Directory**: set to **`voice-agent-platform/backend`** (type it if the picker doesn’t show it).
4. **Runtime**: Node.
5. **Build Command**: `npm install` (or leave default).
6. **Start Command**: `npm start` (runs `node src/server.js`).
7. **Environment variables** (Environment tab):
   - `NODE_ENV` = `production`
   - `PORT` = leave empty (Render sets this)
   - `CORS_ORIGIN` = your frontend URL, e.g. `https://your-app.vercel.app` (add after you deploy the frontend; you can add/update it later)
   - `OPENAI_API_KEY` = your key (optional; only if you use “Add AI assistant”)
8. Create Web Service. Copy the service URL (e.g. `https://your-backend.onrender.com`).

### 2. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your **voxbridge** repo.
3. **Root Directory**: set to **`voice-agent-platform/frontend`** (Edit → type or browse to that path).
4. Framework should auto-detect as **Next.js**. Leave Build/Output as default.
5. **Environment variables**:
   - `NEXT_PUBLIC_SOCKET_URL` = your Render backend URL (e.g. `https://your-backend.onrender.com`).
6. Deploy.

### 3. Connect backend to frontend

1. In **Render** → your backend service → **Environment** → set **`CORS_ORIGIN`** to your Vercel frontend URL (e.g. `https://your-app.vercel.app`). Save (redeploy if needed).
2. In **Vercel** → your frontend project → **Settings** → **Environment Variables** → ensure **`NEXT_PUBLIC_SOCKET_URL`** is the Render backend URL. Redeploy if you change it.

If the Root Directory picker only shows one folder, type the path manually: **`voice-agent-platform/frontend`** for Vercel and **`voice-agent-platform/backend`** for Render.

## Optional: TURN server

For users behind strict NATs or corporate firewalls, configure a TURN server in the frontend env:

```env
NEXT_PUBLIC_TURN_URL=...
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_PASSWORD=...
```

## License

MIT
