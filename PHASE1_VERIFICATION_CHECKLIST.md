# WishCraft — Phase 1 Production Verification Checklist

Run through this in order. Each section assumes the previous one passed.

---

## 1. Backend installation

```bash
cd backend
npm install
```

**Pass criteria:**
- [ ] Completes with no `ERESOLVE` or peer-dependency errors
- [ ] `node_modules/@prisma/client` and `node_modules/.bin/prisma` exist
- [ ] `npm run lint` runs (warnings OK, no crash) — confirms ESM/syntax is valid across `src/`

If install fails on a specific package, note the exact package + error and re-run
`npm install <package>@<version> --save-exact` to pin it, then retry.

---

## 2. Frontend installation

```bash
cd frontend
npm install
```

**Pass criteria:**
- [ ] Completes cleanly
- [ ] `node_modules/.bin/vite` exists
- [ ] `npm run lint` runs without crashing

---

## 3. Required environment variables

Copy both example files and confirm every variable is set (not left as the placeholder value):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**Backend `.env` — must be real values, not the example text:**
- [ ] `DATABASE_URL` — real Postgres connection string
- [ ] `JWT_ACCESS_SECRET` — long random string (`openssl rand -base64 48`)
- [ ] `JWT_REFRESH_SECRET` — a **different** long random string
- [ ] `COOKIE_SECRET` — another distinct random string
- [ ] `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard
- [ ] `CLIENT_URL` matches wherever the frontend actually runs

**Frontend `.env.local`:**
- [ ] `VITE_API_URL` — `/api/v1` for local dev (via proxy), or the full Render URL in production

Server-side check — the app should refuse to boot with a clear message if secrets are missing:
```bash
cd backend && node -e "delete require('fs'); process.env={}; import('./src/config/env.js')"
# Expect: [FATAL] Missing required environment variables: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

---

## 4. PostgreSQL setup

Any of these work:
- Local: `createdb wishcraft` (requires local Postgres install)
- Docker: `docker run --name wishcraft-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wishcraft -p 5432:5432 -d postgres:16`
- Managed: Neon, Supabase, or Render Postgres (get the connection string from their dashboard)

**Pass criteria:**
- [ ] `psql "$DATABASE_URL" -c "SELECT 1;"` returns `1` (or equivalent GUI client connects successfully)
- [ ] Connection string includes `?sslmode=require` for managed providers that require SSL

---

## 5. Prisma migration commands

```bash
cd backend
npx prisma migrate dev --name init
```

**Pass criteria:**
- [ ] Command completes with `Your database is now in sync with your schema`
- [ ] A `backend/prisma/migrations/<timestamp>_init/migration.sql` file was created
- [ ] Tables exist: run `npx prisma studio` and confirm you see `users`, `templates`, `wish_pages`, `media`, `comments`, `likes`, `analytics`, `notifications`, `reports`

For production deploys, the equivalent is:
```bash
npx prisma migrate deploy
```
(applies existing migrations without prompting — this is what `render.yaml`'s build command runs automatically)

---

## 6. Prisma generate commands

```bash
npx prisma generate
```

**Pass criteria:**
- [ ] Runs with no errors
- [ ] `node_modules/@prisma/client/index.js` is regenerated (check its timestamp updates)
- [ ] `node -e "import('./src/config/db.js').then(() => console.log('Prisma client loads OK'))"` prints the success message

This also runs automatically via `postinstall` in `package.json`, so a fresh `npm install` alone should already leave you with a working client.

---

## 7. Cloudinary configuration

```bash
cd backend
node -e "
require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
cloudinary.api.ping().then(r => console.log('Cloudinary OK:', r)).catch(e => console.error('Cloudinary FAILED:', e.message));
"
```

**Pass criteria:**
- [ ] Prints `Cloudinary OK: { status: 'ok' }`
- [ ] If it fails, double-check the three values against your Cloudinary dashboard → Settings → API Keys (no quotes, no trailing spaces)

---

## 8. JWT configuration

**Pass criteria:**
- [ ] `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are different values (reusing one for both weakens token separation)
- [ ] Both are at least 32 characters of random data
- [ ] `JWT_ACCESS_EXPIRES_IN=15m` and `JWT_REFRESH_EXPIRES_IN=30d` are reasonable for your use case (shorten access token life further for higher security, at the cost of more refresh calls)

Quick manual sign/verify test:
```bash
cd backend
node -e "
require('dotenv').config();
const { signAccessToken, verifyAccessToken } = require('./src/utils/jwt.js');
" 2>&1 || echo "Note: this file uses ESM 'import' syntax — test via the running server's /auth/register response instead (see section 15)."
```

---

## 9. Local development commands

Terminal 1:
```bash
cd backend && npm run dev
```
Terminal 2:
```bash
cd frontend && npm run dev
```

**Pass criteria:**
- [ ] Backend logs: `[server] WishCraft API running in development mode on port 5000`
- [ ] Frontend logs: `Local: http://localhost:5173/`
- [ ] Visiting `http://localhost:5173` renders the Home page with no console errors
- [ ] Visiting `http://localhost:5000/api/v1/health` returns `{"success":true,...}`

---

## 10. Production build commands

```bash
cd frontend
npm run build
```

**Pass criteria:**
- [ ] Completes with `✓ built in Xs` and no errors
- [ ] `frontend/dist/index.html` and `frontend/dist/assets/*.js` exist
- [ ] `npm run preview` serves the build and the app loads identically to dev

Backend has no separate build step (plain Node/ESM) — "build" is `npm install && npx prisma generate`, already what `render.yaml` runs.

---

## 11. Render deployment steps

1. Push the repo to GitHub/GitLab.
2. Render dashboard → **New → Blueprint** → select the repo. Render reads `backend/render.yaml` automatically.
3. Confirm it's creating: 1 web service (`wishcraft-api`) + 1 Postgres database (`wishcraft-db`).
4. Before first deploy, fill in the `sync: false` env vars in the Render dashboard: `CLIENT_URL`, `CLIENT_URLS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
5. Deploy. Watch the build log for `npx prisma migrate deploy` completing successfully.
6. Once live, open a Render shell on the service and run `node prisma/seed.js` once.
7. Hit `https://<your-service>.onrender.com/api/v1/health` — confirm `200 OK`.

**Pass criteria:**
- [ ] Build log shows no errors
- [ ] Health check passes (Render also uses this as its own health check — service should show "Live")
- [ ] `SELECT * FROM templates;` via Prisma Studio (pointed at the prod `DATABASE_URL`) shows 11 rows

---

## 12. Vercel deployment steps

1. Vercel dashboard → **Add New → Project** → import the repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset should auto-detect as Vite (from `vercel.json`).
4. Add env var `VITE_API_URL` = `https://<your-render-service>.onrender.com/api/v1`.
5. Deploy.
6. Back on Render, update `CLIENT_URL` / `CLIENT_URLS` to include the new Vercel domain, then redeploy the backend (env var changes require a redeploy on Render).

**Pass criteria:**
- [ ] Vercel build succeeds
- [ ] Visiting the Vercel URL loads Home correctly
- [ ] Registering an account from the deployed frontend succeeds (confirms CORS is configured correctly between the two domains)
- [ ] Refreshing on `/dashboard` (a client-side route) does not 404 (confirms `vercel.json` rewrites are active)

---

## 13. Expected project folder structure

Confirm your working tree matches (run from repo root):
```bash
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | sort
```
Should include, at minimum:
```
backend/prisma/schema.prisma
backend/prisma/seed.js
backend/src/app.js
backend/src/server.js
backend/src/config/{env,db,cloudinary}.js
backend/src/controllers/auth.controller.js
backend/src/middleware/{auth,error,rateLimiter,validate}.middleware.js
backend/src/routes/{index,auth.routes}.js
backend/src/services/auth.service.js
backend/src/utils/{ApiError,ApiResponse,asyncHandler,jwt}.js
backend/src/validators/auth.validator.js
backend/.env.example, render.yaml, package.json
frontend/src/{App,main}.jsx
frontend/src/api/{axiosClient,auth.api}.js
frontend/src/components/*.jsx
frontend/src/context/{AuthContext,ThemeContext}.jsx
frontend/src/pages/{Home,Login,Register,Dashboard,NotFound}.jsx
frontend/vercel.json, package.json, vite.config.js, tailwind.config.js
README.md, API_DOCUMENTATION.md, DATABASE_SCHEMA.md
```

---

## 14. Common build errors and how to fix them

| Error | Cause | Fix |
|---|---|---|
| `PrismaClientInitializationError: Can't reach database server` | Wrong `DATABASE_URL`, DB not running, or missing `?sslmode=require` on a managed DB | Verify connection string; test with `psql` directly first |
| `[FATAL] Missing required environment variables` | `.env` not created or incomplete | `cp .env.example .env` and fill every value |
| `EADDRINUSE: address already in use :::5000` | Another process already on port 5000 | `lsof -i :5000` then kill it, or change `PORT` in `.env` |
| CORS error in browser console (`blocked by CORS policy`) | Frontend origin not in `CLIENT_URL`/`CLIENT_URLS` | Add the exact origin (protocol + domain, no trailing slash) to the backend env var and restart |
| `401 Unauthorized` immediately after login on page refresh | Refresh cookie not being sent — usually a `withCredentials`/CORS `credentials` mismatch | Confirm axios `withCredentials: true` (already set) and that CORS `credentials: true` is set server-side (already set) — check they're not on mismatched domains without HTTPS in prod |
| Vite build fails with `Failed to resolve import` | Missing dependency or typo'd import path | Re-run `npm install`; check the import path casing (case-sensitive on Linux/Render/Vercel even if it worked on macOS/Windows) |
| Tailwind classes not applying | `content` paths in `tailwind.config.js` don't match your files, or dev server wasn't restarted after a config change | Confirm `content: ['./index.html', './src/**/*.{js,jsx}']`; restart `npm run dev` |
| `P2002` errors on register | Duplicate email/username — this is expected behavior, not a bug | Returns `409 Conflict` by design; use a different email/username |
| Render deploy stuck on `prisma migrate deploy` | Migration history conflict, usually from running `migrate dev` locally against the same prod DB | Never point `migrate dev` at production; use `migrate deploy` there only |

---

## 15. Authentication API testing steps

Run against local (`http://localhost:5000/api/v1`) or production, adjusting the base URL.

```bash
BASE=http://localhost:5000/api/v1

# 1. Health check
curl -s $BASE/health | jq

# 2. Register
curl -s -c cookies.txt -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser1","email":"test1@example.com","password":"TestPass1"}' | jq

# 3. Login (save the accessToken from the response)
curl -s -c cookies.txt -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test1@example.com","password":"TestPass1"}' | jq

# 4. Get current user (replace <TOKEN>)
curl -s $BASE/auth/me -H "Authorization: Bearer <TOKEN>" | jq

# 5. Refresh (uses the cookie saved in cookies.txt)
curl -s -b cookies.txt -c cookies.txt -X POST $BASE/auth/refresh | jq

# 6. Update profile
curl -s -X PATCH $BASE/auth/me \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"bio":"Testing WishCraft"}' | jq

# 7. Logout
curl -s -b cookies.txt -X POST $BASE/auth/logout -H "Authorization: Bearer <TOKEN>" | jq

# 8. Confirm token is now unusable for a protected route after logout+password change flows as expected
```

**Pass criteria:**
- [ ] Register returns `201` with a user object + `accessToken`, and sets a `Set-Cookie` header
- [ ] Duplicate register (same email) returns `409`
- [ ] Login with wrong password returns `401`
- [ ] `/auth/me` without a token returns `401`
- [ ] `/auth/refresh` without a valid cookie returns `401`
- [ ] Rate limiting kicks in after 20 rapid auth requests (returns `429`)

---

## 16. Database verification steps

```bash
cd backend
npx prisma studio
```
- [ ] `users` table shows your test user(s) with a **bcrypt hash** in `password` (starts with `$2a$` or `$2b$`), never plaintext
- [ ] `refreshToken` column is also a bcrypt hash, not a raw JWT
- [ ] `templates` table has 11 rows after seeding
- [ ] Deleting a `User` row cascades and removes their `WishPage`s (once Phase 2 data exists) — confirms `onDelete: Cascade` is wired correctly

Or via SQL directly:
```sql
SELECT id, email, username, role, "isVerified", "createdAt" FROM users;
SELECT slug, category, "isPremium" FROM templates ORDER BY category;
```

---

## 17. Security verification checklist

- [ ] `.env` files are **not** committed (`git status` shows them ignored)
- [ ] Response headers include Helmet's defaults — check with `curl -I $BASE/health` for `X-Content-Type-Options`, `X-DNS-Prefetch-Control`, etc.
- [ ] Access tokens are never written to `localStorage`/`sessionStorage` (confirm in browser DevTools → Application tab — only the httpOnly refresh cookie should be visible there, and it should be unreadable via `document.cookie` in the console)
- [ ] Passwords under 8 characters, or missing an uppercase/lowercase/number, are rejected with a `400` and field-level message
- [ ] Hitting `/auth/login` 25+ times rapidly triggers `429`
- [ ] A request with a tampered/invalid JWT returns `401`, not a 500 crash
- [ ] SQL injection attempt in a field (e.g. `identifier: "' OR 1=1--"`) returns a normal `401` — Prisma parameterizes queries by default, so this should never reach raw SQL
- [ ] CORS from an unlisted origin is rejected (test with `curl -H "Origin: https://evil.example.com" -I $BASE/health` — no `Access-Control-Allow-Origin` header should come back for that origin)
- [ ] `NODE_ENV=production` on both Render and locally-simulated prod builds hides stack traces in error responses (check the `errorHandler` — `response.stack` is only attached when `!env.isProduction`)

---

## 18. Final production readiness checklist

- [ ] Sections 1–17 above all pass
- [ ] Admin seed password (`SEED_ADMIN_PASSWORD`) has been changed from the default in any real deployment
- [ ] All secrets (`JWT_*_SECRET`, `COOKIE_SECRET`, Cloudinary keys) are unique per environment (dev ≠ staging ≠ prod)
- [ ] `CLIENT_URL`/`CLIENT_URLS` on Render list only real, intended frontend origins
- [ ] Database has automated backups enabled (Render Postgres: on by default for paid plans — confirm your plan)
- [ ] A rollback plan exists: Render keeps prior deploys one click away; know how to redeploy a previous commit
- [ ] `robots.txt` and `manifest.webmanifest` resolve correctly on the deployed frontend
- [ ] Error responses in production never leak stack traces or internal file paths (spot-check by hitting a bad route in prod)

Once every box above is checked, Phase 1 is production-verified and Phase 2 can build on a trusted foundation.
