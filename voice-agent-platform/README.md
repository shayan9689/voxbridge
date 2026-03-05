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

## Deployment (e.g. Vercel)

The repo root is **voxbridge**; the app lives in **voice-agent-platform**. Deploy **frontend** and **backend** as separate projects.

### Frontend (Next.js)

1. Create a new project and connect the **voxbridge** repo.
2. Set **Root Directory**: click **Edit** next to “Root Directory” and set it to **`voice-agent-platform/frontend`** (type the path or open **voice-agent-platform** → **frontend**).
3. Framework should auto-detect as **Next.js**. Add env var **`NEXT_PUBLIC_SOCKET_URL`** = your backend URL (e.g. `https://your-backend.vercel.app` or your Node server URL).
4. Deploy.

### Backend (Node)

1. Create another project and connect the same **voxbridge** repo.
2. Set **Root Directory** to **`voice-agent-platform/backend`**.
3. Add env vars (e.g. **`PORT`**, **`CORS_ORIGIN`** = your frontend URL, **`OPENAI_API_KEY`** if you use the AI assistant).
4. Deploy. Use the deployed backend URL as **NEXT_PUBLIC_SOCKET_URL** in the frontend project.

If the directory picker only shows **backend**, set Root Directory by **typing** `voice-agent-platform/frontend` in the Root Directory field instead of browsing.

## Optional: TURN server

For users behind strict NATs or corporate firewalls, configure a TURN server in the frontend env:

```env
NEXT_PUBLIC_TURN_URL=...
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_PASSWORD=...
```

## License

MIT
