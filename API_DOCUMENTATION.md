# WishCraft API Documentation — Phase 1

Base URL (local): `http://localhost:5000/api/v1`
Base URL (production): `https://<your-render-service>.onrender.com/api/v1`

All responses share this envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable summary",
  "data": { }
}
```

Errors share the same shape with `success: false` and an `errors` array for
field-level validation issues:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Enter a valid email address" }]
}
```

## Authentication model

- **Access token**: short-lived JWT (default 15 min), returned in the JSON
  response body. Send it on every authenticated request as
  `Authorization: Bearer <token>`.
- **Refresh token**: long-lived JWT (default 30 days), set automatically as an
  **httpOnly, secure cookie** on `/auth/register`, `/auth/login`, and
  `/auth/refresh`. It is never exposed to JavaScript. The browser sends it
  automatically as long as requests use `credentials: 'include'` /
  `withCredentials: true`.
- On a `401` with an expired access token, call `POST /auth/refresh` to get a
  new access token, then retry the original request. The frontend's axios
  client already does this automatically.

---

## Endpoints

### `GET /health`

Health check. No auth required.

**Response `200`**
```json
{ "success": true, "data": { "status": "ok", "timestamp": "2026-08-05T12:00:00.000Z" } }
```

---

### `POST /auth/register`

Create a new account. Sets the refresh cookie and returns an access token.

**Body**
```json
{
  "name": "Jordan Lee",
  "username": "jordanlee",
  "email": "jordan@example.com",
  "password": "StrongPass1"
}
```

Rules: `username` — 3-30 chars, lowercase letters/numbers/underscores only.
`password` — 8+ chars, must include an uppercase letter, a lowercase letter,
and a number.

**Response `201`**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "...", "name": "Jordan Lee", "username": "jordanlee", "email": "jordan@example.com", "role": "USER", "isVerified": false, "createdAt": "..." },
    "accessToken": "eyJhbGciOi..."
  }
}
```

**Errors**: `409` if email or username already taken, `400` on validation failure.

---

### `POST /auth/login`

**Body**
```json
{ "identifier": "jordan@example.com", "password": "StrongPass1" }
```

`identifier` accepts either email or username.

**Response `200`** — same shape as register.
**Errors**: `401` on invalid credentials.

---

### `POST /auth/refresh`

Reads the refresh cookie, rotates it, and returns a new access token. No body
required — the cookie does the work.

**Response `200`**
```json
{ "success": true, "data": { "accessToken": "eyJhbGciOi..." } }
```

**Errors**: `401` if the cookie is missing, expired, or invalid.

---

### `POST /auth/logout`  🔒 requires auth

Invalidates the stored refresh token server-side and clears the cookie.

**Response `200`**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### `GET /auth/me`  🔒 requires auth

Returns the currently authenticated user.

**Response `200`**
```json
{ "success": true, "data": { "user": { "id": "...", "name": "...", "username": "...", "email": "...", "avatarUrl": null, "bio": null, "website": null, "socialLinks": null, "role": "USER", "isVerified": false, "createdAt": "..." } } }
```

---

### `PATCH /auth/me`  🔒 requires auth

Update profile fields. All fields optional.

**Body**
```json
{
  "name": "Jordan A. Lee",
  "bio": "Making the internet a little more celebratory.",
  "website": "https://jordanlee.dev",
  "socialLinks": { "instagram": "@jordanlee" }
}
```

**Response `200`** — updated user object.

---

### `PATCH /auth/me/password`  🔒 requires auth

**Body**
```json
{ "currentPassword": "StrongPass1", "newPassword": "EvenStrongerPass2" }
```

Invalidates the current session (refresh token cleared) — the client must log
in again after this call.

**Response `200`**
```json
{ "success": true, "message": "Password changed successfully. Please log in again.", "data": null }
```

**Errors**: `400` if `currentPassword` is incorrect.

---

## Rate limits

- General API: 300 requests / 15 min per IP.
- `/auth/*`: 20 requests / 15 min per IP (successful requests don't count
  against the limit).

## Status codes used throughout

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Resource created |
| 400  | Validation error / malformed request |
| 401  | Missing, invalid, or expired credentials |
| 403  | Authenticated but not authorized (e.g. non-admin) |
| 404  | Resource not found |
| 409  | Conflict (duplicate email/username/slug) |
| 429  | Rate limit exceeded |
| 500  | Unexpected server error |

---

---

# Phase 2 — Templates, Wishes, and Media

## Templates

### `GET /templates`

Public. Optional `?category=` query filters by category.

**Response `200`**
```json
{ "success": true, "data": { "templates": [ { "id": "...", "name": "Premium Dark", "slug": "premium-dark", "category": "Premium", "thumbnailUrl": "...", "isPremium": true, "config": { "background": "#0b0b0f", "accent": "#d4af37", "font": "Playfair Display" } } ], "count": 11 } }
```

### `GET /templates/:slug`

Public. Returns a single template or `404`.

---

## Wishes

### `POST /wishes`  🔒 requires auth

Creates a new wish page as a `DRAFT`. All required content fields are
collected up front, so the slug (and therefore the permanent share link) is
generated immediately and never changes.

**Body**
```json
{
  "eventType": "BIRTHDAY",
  "templateId": "<template-uuid>",
  "recipientName": "Sadia Rahman",
  "senderName": "Aariz",
  "title": "Happy Birthday, Sadia!",
  "message": "Wishing you the most joyful year yet.",
  "eventDate": "2026-09-12T00:00:00.000Z",
  "location": "Dhaka, Bangladesh",
  "phone": "+8801XXXXXXXXX",
  "email": "sadia@example.com",
  "website": "https://example.com",
  "googleMapsUrl": "https://maps.google.com/...",
  "countdownEnabled": true,
  "slugHint": "sadia-birthday"
}
```
`slugHint` is optional — if omitted, the slug is derived from `recipientName`.
On collision, WishCraft appends `-2`, `-3`, etc. automatically.

**Response `201`**
```json
{
  "success": true,
  "data": {
    "wish": { "id": "...", "slug": "sadia-birthday", "uuid": "...", "status": "DRAFT", "eventType": "BIRTHDAY", "template": { "...": "..." }, "media": [] },
    "shareUrl": "/w/sadia-birthday"
  }
}
```

**Errors**: `400` validation, `404` if `templateId` doesn't match an active template.

---

### `GET /wishes/mine`  🔒 requires auth

Lists the authenticated user's wish pages, newest-updated first.

**Query params**: `status` (`DRAFT`|`PUBLISHED`|`ARCHIVED`, optional), `page` (default 1), `limit` (default 20, max 50).

**Response `200`**
```json
{ "success": true, "data": { "wishes": [ /* ... */ ], "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 } } }
```

---

### `GET /wishes/:id`  🔒 requires auth, owner only

Full detail view (for editing) including ordered media. `403` if you don't own it, `404` if it doesn't exist.

---

### `PATCH /wishes/:id`  🔒 requires auth, owner only

Partial update — send only the fields you're changing. Used throughout the
create-wish flow (cover photo, theme, animation, countdown, etc.) and for
later edits.

**Body (all optional)**
```json
{
  "coverPhotoUrl": "https://res.cloudinary.com/.../cover.jpg",
  "theme": { "color": "#7c3aed", "font": "Fraunces" },
  "animationSettings": { "effect": "confetti" },
  "countdownEnabled": true
}
```

---

### `PATCH /wishes/:id/publish`  🔒 requires auth, owner only

Transitions the page from `DRAFT` to `PUBLISHED` and sets `publishedAt`.
Idempotent — calling it again on an already-published page is a no-op.

**Response `200`**
```json
{ "success": true, "data": { "wish": { "...": "...", "status": "PUBLISHED" }, "shareUrl": "/w/sadia-birthday" } }
```

### `PATCH /wishes/:id/unpublish`  🔒 requires auth, owner only

Moves a page back to `DRAFT` (unlists it from public view without deleting it).

### `DELETE /wishes/:id`  🔒 requires auth, owner only

Deletes the wish page, its `Media` rows, and best-effort removes the
associated Cloudinary assets.

---

### `GET /wishes/public/:slug`

**No auth.** Returns a wish page only if it's `PUBLISHED` — drafts and
archived pages 404 here regardless of who asks, so a shared draft link can
never leak content. Increments `viewCount` on each call (fire-and-forget,
doesn't block the response).

---

### `POST /wishes/:id/media`  🔒 requires auth, owner only

Attaches an already-uploaded Cloudinary asset (see `/media/upload` below) to
a wish page's gallery.

**Body**
```json
{ "url": "https://res.cloudinary.com/.../photo.jpg", "publicId": "wishcraft/gallery/abc123", "type": "IMAGE", "order": 0 }
```

### `DELETE /wishes/:id/media/:mediaId`  🔒 requires auth, owner only

Removes a gallery item and deletes the underlying Cloudinary asset.

---

## Media

### `POST /media/upload`  🔒 requires auth

`multipart/form-data` with a single field named `file`. Optional `folder`
field (alphanumeric/hyphen/underscore, max 40 chars) organizes uploads in
Cloudinary, e.g. `folder=gallery` or `folder=music`.

Accepted types: JPEG/PNG/WebP/GIF (images, max 8MB), MP4/WebM/QuickTime
(video, max 50MB), MP3/WAV/OGG (audio, max 15MB).

This endpoint only uploads and returns the result — it does not write to the
database. Use the returned `url`/`publicId` with `PATCH /wishes/:id` (for
`coverPhotoUrl`, `recipientPhotoUrl`, or `musicUrl`) or `POST
/wishes/:id/media` (for gallery items).

**Response `201`**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/wishcraft/image/upload/v.../abc123.jpg",
    "publicId": "wishcraft/gallery/abc123",
    "resourceType": "image",
    "format": "jpg",
    "width": 1600,
    "height": 1200,
    "bytes": 482113
  }
}
```

**Errors**: `400` for an unsupported type or a file over its size limit.

---

## Endpoints planned for later phases

`/comments`, `/likes`, `/analytics`, `/notifications`, `/admin/*` — the
database schema already supports all of these; only the routes/controllers
are pending (Phase 3 builds the frontend for what's above; Phase 4 adds
these interactive/analytics endpoints; Phase 5 is the admin panel).
