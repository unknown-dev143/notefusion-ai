# NoteFusion AI — Go Live (Render + Vercel)

## 1. Commit & push deploy fixes

From the repo root, commit the deploy config fixes and push to `main`.
Render Blueprints and Vercel both deploy from GitHub.

## 2. Backend on Render

1. Open https://dashboard.render.com → **New** → **Blueprint**
2. Connect `unknown-dev143/notefusion-ai` and select the branch with `render.yaml`
3. Apply the Blueprint (creates `notefusion-backend`, Postgres, Redis)
4. After the first deploy, open **notefusion-backend** → **Environment** and set:
   - `OPENAI_API_KEY` (or leave empty to use limited/fallback AI)
   - `STRIPE_*` / `GOOGLE_*` / `SMTP_*` only if you use those features now
5. Copy the service URL, e.g. `https://notefusion-backend.onrender.com`
6. Verify: open `https://YOUR-BACKEND.onrender.com/health`

Free-tier note: the web service sleeps after idle; the first request can take ~30–60s.

## 3. Frontend on Vercel

1. Run `vercel login` in a terminal (one-time)
2. From repo root:

```bash
vercel --prod --yes \
  -e VITE_API_URL=https://YOUR-BACKEND.onrender.com/api/v1 \
  -e VITE_WS_URL=wss://YOUR-BACKEND.onrender.com/ws \
  -e VITE_APP_NAME="NoteFusion AI"
```

Or in the Vercel dashboard: import the repo, set Root Directory to `.` (uses root `vercel.json`), add the same env vars, Deploy.

3. Copy the frontend URL, e.g. `https://notefusion-ai.vercel.app`

## 4. Wire CORS

In Render → **notefusion-backend** → Environment, set:

```
BACKEND_CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app,http://localhost:3000
```

Redeploy the backend (or wait for auto restart).

## 5. Smoke test

- [ ] `/health` returns ok
- [ ] Frontend loads
- [ ] Sign up / login works
- [ ] Create a note
- [ ] One AI action (if key is set)
