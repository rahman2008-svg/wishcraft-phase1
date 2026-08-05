# WishCraft Database Schema

PostgreSQL, managed through Prisma (`backend/prisma/schema.prisma`). This
schema is built for the **entire** product roadmap, not just Phase 1 — so
later phases add API surface, not migrations that reshape existing tables.

## Entity overview

| Model          | Purpose                                                              | Phase implemented |
|----------------|-----------------------------------------------------------------------|--------------------|
| `User`         | Accounts, auth, profile                                               | **1** |
| `Template`     | Design templates (Premium Dark, Glass, Islamic, etc.)                 | **1** (seeded), CRUD in later phase |
| `WishPage`     | A single created greeting/invitation page                             | Phase 2 |
| `Media`        | Photos/videos attached to a wish page (Cloudinary-backed)             | Phase 2 |
| `Comment`      | Guest book comments, with threaded replies                            | Phase 4 |
| `Like`         | Reactions on a wish page (emoji-based)                                | Phase 4 |
| `Analytics`    | Per-visit tracking (country, device, referrer)                        | Phase 4 |
| `Notification` | In-app notifications for page owners                                  | Later |
| `Report`       | User-submitted reports on comments/pages                              | Later |

## Relationships

```
User 1───* WishPage
User 1───* Comment
User 1───* Like
User 1───* Notification
User 1───* Report

Template 1───* WishPage

WishPage 1───* Media
WishPage 1───* Comment
WishPage 1───* Like
WishPage 1───* Analytics
WishPage 1───* Report

Comment 1───* Comment   (self-relation: replies, via parentId)
```

## Field notes by model

### `User`
- `email` and `username` are both unique — login accepts either (see
  `POST /auth/login`).
- `password` stores a bcrypt hash (12 rounds), never the plaintext.
- `refreshToken` stores a **bcrypt hash of the current refresh JWT**, not the
  raw token — a leaked database row can't be replayed as a session.
- `role` is `USER` or `ADMIN`, checked by the `requireAdmin` middleware for
  the future admin panel.
- `socialLinks` is a flexible `Json` field (instagram/facebook/twitter/tiktok
  today; new platforms don't need a migration).

### `Template`
- `slug` is the stable identifier used in template selection URLs.
- `config` (`Json`) holds the design tokens for that template (background,
  accent color, font) so the rendering engine in Phase 2/3 is data-driven
  rather than hardcoded per template.
- `isPremium` gates access for future monetization.

### `WishPage`
- `uuid` (separate from the primary `id`) and `slug` are both unique. `slug`
  is the human-readable, URL-safe identifier (e.g. `rahman2027`); on
  collision the create-flow appends `-2`, `-3`, etc. `uuid` backs the
  `/w/:uuid` short-link form.
- `status` is `DRAFT | PUBLISHED | ARCHIVED` — only `PUBLISHED` pages are
  publicly visible once Phase 2 ships the public route.
- `theme` and `animationSettings` are `Json` — per-page overrides layered on
  top of the chosen `Template.config`.
- `viewCount` is a denormalized counter updated alongside `Analytics` rows,
  so read-heavy public pages don't need a `COUNT(*)` on every view.

### `Media`
- `type` distinguishes `IMAGE` / `VIDEO`; `publicId` is the Cloudinary public
  ID (needed for deletion/transformation, not just the `url`).
- `order` supports drag-to-reorder galleries.

### `Comment`
- Self-referencing via `parentId` for one level (or more) of threaded
  replies. Deleting a parent sets `parentId` to `NULL` on children
  (`onDelete: SetNull`) rather than cascading, so replies survive parent
  deletion and can still render as "[deleted]".
- `guestName` supports unauthenticated guest comments; `userId` is nullable
  for the same reason.

### `Like`
- Unique on `(wishPageId, ipAddress, emoji)` so an anonymous visitor can't
  spam the same reaction, while still allowing multiple different emoji
  reactions from the same visitor.

### `Analytics`
- One row per visit. `country`/`device`/`browser`/`os` are derived
  server-side from the request (IP geolocation + user-agent parsing) in the
  phase that implements tracking — the schema is ready now.

### `Notification`
- `type` enum (`COMMENT | LIKE | VIEW | SYSTEM`) keeps the notification
  center simple to filter/badge in the UI.

### `Report`
- Nullable `wishPageId` supports reporting entities beyond wish pages later
  (e.g. a user profile) without a schema change.

## Running migrations

```bash
cd backend
npx prisma migrate dev --name <description>   # local dev
npx prisma migrate deploy                       # production (run by Render build)
npx prisma studio                                # visual data browser
```

## Seed data

`backend/prisma/seed.js` seeds the 11 templates named in the product brief
(Premium Dark, Minimal White, Luxury Gold, Cute, Glass, Floral, Kids,
Islamic, Corporate, Neon, Nature) and one `ADMIN` user
(`admin@wishcraft.app` / password from `SEED_ADMIN_PASSWORD`, default
`ChangeMe123!` — **change this immediately in any real deployment**).
