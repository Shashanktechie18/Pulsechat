# Echo Chat App

Realtime chat platform with direct messaging, group channels, read receipts, typing indicators, browser notifications, and WebRTC audio/video calls.

## Stack
- Frontend: React + Vite + Socket.IO client
- Backend: Node.js + Express + Socket.IO + MongoDB (Mongoose)
- Auth: JWT

## Project Structure
- `client/`: Vite frontend
- `server/`: API, Socket.IO signaling, auth, persistence
- `vercel.json`: Backend deployment config (root project)
- `client/vercel.json`: Frontend SPA rewrite config
- `render.yaml`: Backend deployment blueprint for Render

## Local Setup
1. Install dependencies:
```bash
cd server
npm install
cd ../client
npm install
```
2. Create `server/.env` with:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
HTTP_PORT=5000
TCP_PORT=9000
NODE_ENV=development
ENABLE_TCP_SERVER=true
```
3. Optional `client/.env` for endpoint overrides:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL_LOCAL=http://localhost:5000
VITE_SOCKET_URL_LOCAL=http://localhost:5000
```
4. Run the backend:
```bash
cd server
npm start
```
5. Run the frontend:
```bash
cd client
npm run dev
```

## Deployment

### Recommended: Vercel (Frontend) + Render (Backend)
This is the most reliable setup for Socket.IO + WebRTC signaling.

### Deploy Frontend on Vercel
1. Create a Vercel project using `client/` as the project root.
2. Build settings:
- Build Command: `npm run build`
- Output Directory: `dist`
3. Add frontend env vars in Vercel:
- `VITE_API_URL=https://namaste-messenger.onrender.com`
- `VITE_SOCKET_URL=https://namaste-messenger.onrender.com`
- `VITE_API_URL_LOCAL=http://localhost:5000`
- `VITE_SOCKET_URL_LOCAL=http://localhost:5000`
4. `client/vercel.json` already rewrites SPA routes to `index.html`.

### Deploy Backend on Render
1. In Render, create a Blueprint deployment from this repo root.
2. Render will detect `render.yaml` and create `echo-chat-app-api` from `server/`.
3. Set required env vars in Render:
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGINS` (comma-separated frontend origins, for example `https://namaste-messenger-hrtf.vercel.app`)
4. Keep `ENABLE_TCP_SERVER=false` on Render unless you explicitly need the TCP bridge.
5. Health endpoint: `/api/health`

### Deploy Full Stack on Render (Frontend + Backend)
`render.yaml` now defines both services:
- `echo-chat-app-web` (static frontend from `client/`)
- `echo-chat-app-api` (Node backend from `server/`)

Steps:
1. Create a single Blueprint deployment in Render from repo root.
2. Wait for both services to be provisioned.
3. Set backend env vars on `echo-chat-app-api`:
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGINS=https://<your-render-frontend>.onrender.com`
4. Set frontend env vars on `echo-chat-app-web`:
- `VITE_API_URL=https://namaste-messenger.onrender.com`
- `VITE_SOCKET_URL=https://namaste-messenger.onrender.com`
5. Redeploy frontend after setting env vars so Vite bakes them at build time.

### Backend on Vercel (Optional)
`vercel.json` at repo root can deploy the Node backend. For realtime socket-heavy production traffic, Render is generally better.

### Frontend + Backend on Vercel (Optional)
If you want both parts on Vercel:
1. Deploy `client/` as one Vercel project (uses `client/vercel.json`).
2. Deploy repo root as second Vercel project for backend API (uses root `vercel.json`).
3. Point frontend env vars to backend URL:
- `VITE_API_URL=https://<your-backend>.vercel.app`
- `VITE_SOCKET_URL=https://<your-backend>.vercel.app`
- `VITE_API_URL_LOCAL=http://localhost:5000`
- `VITE_SOCKET_URL_LOCAL=http://localhost:5000`

## Verification
- Frontend build:
```bash
cd client
npm run build
```
- Backend syntax check:
```bash
cd server
node --check server.js
```

## Notes
- Branding in UI is set to `Echo Chat App`.
- Chat workspace now uses a light, WhatsApp-style visual theme.
- The chat resizer strip has been removed for a cleaner layout.
