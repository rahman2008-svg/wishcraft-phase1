# WishCraft

**Create • Share • Celebrate**

WishCraft is a modern event greeting platform — design beautiful birthday, wedding,
and celebration pages and share a permanent link in minutes.

This repository is being built in phases. **Phase 1 (this release)** delivers the
production foundation: project architecture, the full database schema, and a
complete JWT authentication system end-to-end (backend API + frontend UI),
deployable today to Render and Vercel.

---

## What's in Phase 1

- **Backend**: Node.js + Express API, layered as `routes → controllers → services`,
  with centralized error handling, Zod validation, rate limiting, and security
  hardening (Helmet, CORS allowlist, HPP, XSS sanitization).
- **Database**: PostgreSQL via Prisma. The schema models the **entire** product
  (Users, WishPages, Templates, Media, Comments, Likes, Analytics, Notifications,
  Reports) so future phases are pure feature work, not migrations that fight the
  data model.
- **Auth**: Register, login, silent session restore, access/refresh token
  rotation, logout, profile updates, password change — all working, not stubbed.
  Access tokens are short-lived and held in memory on the client; refresh tokens
  are long-lived, httpOnly, and rotated on every use.
- **Frontend**: React 19 + Vite + Tailwind, with a real design system (glass
  panels, gradient tokens, dark/light mode), React Router, React Hook Form + Zod,
  TanStack Query, and Framer Motion — wired to the live API, not mocked.
- **Cloudinary**: SDK configured and ready; the upload endpoints ship in Phase 2
  alongside the wish-creation flow.
- **Deployment**: `render.yaml` blueprint for the API + managed Postgres, and
  `vercel.json` for the frontend, both ready to deploy as-is.

## What's in Phase 2

The wish engine's **backend API** is now complete and working end-to-end:

- `POST /wishes` — create a wish page as a draft, with the permanent slug
  generated immediately (with automatic `-2`/`-3` collision handling)
- `GET /wishes/mine`, `GET /wishes/:id`, `PATCH /wishes/:id`, `DELETE /wishes/:id`
  — full CRUD, all ownership-checked
- `PATCH /wishes/:id/publish` / `/unpublish` — the draft → published transition
- `GET /wishes/public/:slug` — public retrieval (published only, 404s
  everything else so drafts never leak), with view-count tracking
- `POST /media/upload` — real Cloudinary uploads (images/video/audio) via
  streamed multipart, with type/size validation
- `POST /wishes/:id/media` / `DELETE /wishes/:id/media/:mediaId` — gallery
  management, with best-effort Cloudinary cleanup on delete
- `GET /templates`, `GET /templates/:slug` — public template listing

See `API_DOCUMENTATION.md` for full request/response examples.

## What's intentionally NOT in Phase 2

The **frontend** create-wish wizard, comments/likes/guestbook, analytics
ingestion UI, search, and the admin panel are scoped to Phases 3–5 per the
build plan. The database schema and backend API already support wish
creation end-to-end — Phase 3 is the UI that calls it.

---

## What's in Phase 3

The full **create-wish wizard** is now live end-to-end on the frontend,
calling the real Phase 2 API at every step (no mocked data):

1. **Event** — pick from all 19 event types
2. **Template** — live-loaded from `GET /templates`
3. **Info** — recipient/sender/title/message/date/location/contact fields;
   submitting this step calls `POST /wishes` and creates the permanent slug
4. **Media** — cover photo + gallery photos/video, uploaded to Cloudinary via
   `POST /media/upload` and attached via `POST /wishes/:id/media`
5. **Music** — background track upload
6. **Customize** — accent color + celebration effect, persisted via `PATCH`
7. **Preview & Publish** — live-rendered preview card, then `PATCH
   /wishes/:id/publish`
8. **Share** — permanent link, QR code, copy button, and WhatsApp / Facebook
   / Messenger / Telegram / X share links

Also shipped: a real **My Wishes** dashboard page (`/dashboard/wishes`) with
publish/unpublish/delete, status filters, and copy-link — and the main
Dashboard now shows live wish counts instead of static placeholders.

## What's intentionally NOT in Phase 3

The **public wish page itself** (`/w/:slug` rendering the published page for
visitors) is Phase 4, along with comments, likes, guestbook, share/reaction
UI on that page, and analytics ingestion. Right now, visiting a published
share link in the browser will hit the app's 404 page — the *data* is fully
live via `GET /wishes/public/:slug`, but there's no route rendering it yet.
The admin panel is Phase 5.

---

## Project structure

```
wishcraft/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Full data model for all phases
│   │   └── seed.js             # Seeds templates + an admin account
│   ├── src/
│   │   ├── config/              # env, Prisma client, Cloudinary
│   │   ├── controllers/         # HTTP layer (auth, template, wish, media)
│   │   ├── middleware/          # auth, validation, errors, rate limit, upload
│   │   ├── routes/               # Express routers
│   │   ├── services/             # business logic (auth, template, wish, cloudinary)
│   │   ├── utils/                # ApiError, ApiResponse, asyncHandler, jwt, slugify
│   │   ├── validators/           # Zod schemas (auth, wish)
│   │   ├── app.js               # Express app assembly
│   │   └── server.js            # entrypoint + graceful shutdown
│   ├── .env.example
│   ├── render.yaml
│   └── package.json
├── frontend/
│   ├── public/                   # favicon, manifest, robots.txt
│   ├── src/
│   │   ├── api/                  # axios client + auth/template/wish/media requests
│   │   ├── components/           # Navbar, Footer, route guards, layout
│   │   │   └── wizard/             # 8-step create-wish wizard components
│   │   ├── constants/              # event types, animation effects, theme colors
│   │   ├── context/               # Auth + Theme providers
│   │   ├── hooks/                 # useAuth, useTemplates, useWishes
│   │   ├── pages/                  # Home, Login, Register, Dashboard, MyWishes,
│   │   │                            CreateWish, 404
│   │   └── styles/                 # Tailwind layer + design tokens
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── PHASE1_VERIFICATION_CHECKLIST.md
└── README.md
```

---

## Local setup

### Prerequisites

- Node.js ≥ 18.18
- A PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), or Render)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL, JWT secrets, Cloudinary credentials

npm install
npx prisma migrate dev --name init   # creates tables
npm run prisma:seed                  # seeds templates + admin user
npm run dev                          # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/v1/health`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# VITE_API_URL=/api/v1 works out of the box with the Vite dev proxy

npm install
npm run dev                          # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000` (see
`vite.config.js`), so the frontend and backend talk to each other with zero
extra configuration locally.

---

## Environment variables

See `backend/.env.example` and `frontend/.env.example` — every variable is
documented inline. Never commit `.env` files; both are already in `.gitignore`.

---

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint** and point it at the repo —
   `backend/render.yaml` defines the web service and a managed Postgres
   database automatically.
3. Set the `sync: false` variables in the Render dashboard: `CLIENT_URL`,
   `CLIENT_URLS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`.
4. Render runs `npx prisma migrate deploy` automatically as part of the build
   command, so your schema is applied on every deploy.
5. After the first deploy, run the seed script once from the Render shell:
   `node prisma/seed.js`.

### Frontend → Vercel

1. Import the repo into Vercel, set the **root directory** to `frontend`.
2. Vercel auto-detects Vite; `vercel.json` adds SPA rewrites so client-side
   routes (like `/dashboard`) work on refresh and direct links.
3. Set `VITE_API_URL` to your deployed Render URL, e.g.
   `https://wishcraft-api.onrender.com/api/v1`.
4. Back on Render, set `CLIENT_URL`/`CLIENT_URLS` to your Vercel domain(s) so
   CORS allows the deployed frontend.

---

## Security notes

- Passwords are hashed with bcrypt (12 rounds). Refresh tokens are hashed
  before being stored, so a leaked database never exposes usable tokens.
- Access tokens are short-lived (15 min default) and never stored in
  `localStorage` — they live only in memory on the client, refreshed
  transparently via the httpOnly cookie.
- Rate limiting is stricter on `/auth/*` routes to slow down credential
  stuffing.
- All input is validated with Zod on the server (never trust the client),
  mirrored on the frontend for instant feedback.

See `API_DOCUMENTATION.md` for the full endpoint reference and
`DATABASE_SCHEMA.md` for the data model.
