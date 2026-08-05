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

## Endpoints planned for later phases

`/wishes`, `/templates`, `/comments`, `/media` (Cloudinary uploads),
`/analytics`, `/notifications`, `/admin/*` — the database schema already
supports all of these; only the routes/controllers are pending.
