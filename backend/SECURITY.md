# Fleet Management System Security Architecture & Configuration

## 1. Content Security Policy (CSP) & HTTP Security Headers
- **Middleware**: `backend/middleware/security.middleware.js` (`helmet` v8.3.0) + `backend/config/csp.config.js`
- **Frontend HTML Layers**:
  - Express static/SPA serving in `backend/app.js`
  - Vite dev/preview headers in `frontend/vite.config.js`
  - Static deployment headers in `frontend/public/_headers` and `deploy/nginx-csp.conf`
- **Policy Directives**:
  - `default-src 'self'`
  - `script-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.google.com https://www.gstatic.com` *(strictly without `'unsafe-inline'` or `'unsafe-eval'`; Zod v4 uses `z.config({ jitless: true })` via `frontend/src/utils/cspSetup.js`)*
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://translate.googleapis.com`
  - `img-src 'self' data: blob: <API origins> https://res.cloudinary.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://api.mapbox.com https://cdnjs.cloudflare.com https://images.unsplash.com https://imagedelivery.net ...`
  - `font-src 'self' data: https://fonts.gstatic.com`
  - `connect-src 'self' <API + Socket.IO HTTP/WS/WSS origins> https://api.cloudinary.com https://res.cloudinary.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://firebase.googleapis.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com https://api.mapbox.com https://events.mapbox.com https://router.project-osrm.org https://nominatim.openstreetmap.org https://photon.komoot.io ...`
  - `frame-src 'self' data: blob: <API origins> https://res.cloudinary.com https://www.google.com https://recaptcha.google.com https://www.gstatic.com https://translate.google.com`
  - `worker-src 'self' blob:`
  - `frame-ancestors 'none'` *(scoped on `/uploads` & `/api/uploads` to `'self'` + trusted frontend origins for PDF iframe previews)*
  - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`
  - `report-uri /api/security/csp-report`

## 2. Environment Variables
| Variable | Default | Description |
| :--- | :--- | :--- |
| `CSP_MODE` | `enforce` | Set `report-only` to audit CSP without blocking, or `enforce` for active enforcement |
| `CSP_ALLOW_STYLE_INLINE` | `true` | Enables `'unsafe-inline'` in `style-src` for runtime styling libraries (`script-src` remains strict) |
| `CSP_UPGRADE_INSECURE` | `false` | Set `true` behind HTTPS-only production termination to emit `upgrade-insecure-requests` |
| `CSP_EXTRA_FRONTEND_ORIGINS` | `""` | Comma-separated extra trusted web frontend origins for CORS/CSRF/uploads iframe |
| `CSP_EXTRA_API_ORIGINS` | `""` | Comma-separated extra trusted API origins |
| `SERVE_FRONTEND` | `true` | Serves `frontend/dist` SPA HTML from Express with Helmet CSP when built |
| `NODE_ENV` | `development` | Strict production security guards (disables demo fixed OTP and dev password fallbacks) |

## 3. Brute-Force Protection, Auth & RBAC
- **Rate Limits** (`backend/middleware/rateLimit.middleware.js`):
  - Login & OTP verification (`/api/auth/login`, `/api/auth/login-otp`, `/api/driver/login`, `/api/driver/verify-otp`): 10 requests / 15 min per IP (`429`).
  - Password reset / OTP dispatch (`/api/auth/forgot-password`, `/api/driver/send-otp`): 5 requests / 15 min per IP (`429`).
  - Contact form: 5 requests / 10 min per IP.
  - Global `/api`: 300 requests / min per IP.
- **Temporary Account Lockouts** (`backend/models/LoginLockout.js` + `securityMonitor.service.js`):
  - Keyed per `(clientIP + identifier)` using configured `Settings.securitySettings.maxLoginAttempts` (default `5`, clamped `3..10`).
  - Locks temporarily for 15 minutes (`429` + `Retry-After`) after repeated failed credential attempts; cleared automatically upon valid login or manually by Super Admin (`DELETE /api/admin/security/lockouts/:id`).
- **JWT & Passwords**:
  - `protect` verifies Bearer JWTs via `JWT_SECRET` without logging stack traces or raw tokens.
  - Passwords hashed with bcrypt (`comparePassword` only; raw plaintext comparison removed in `driverApi.controller.js`).
  - Role enforcement via `authorizeRoles(...)` strictly guards Admin, Manager, and Driver routes.

## 4. Input, Injection, CSRF, CORS & Upload Defenses
- **Middleware** (`backend/middleware/threatDefense.middleware.js`):
  - `preventNoSqlInjection`: recursively rejects `$`-prefixed Mongo operators (`$gt`, `$ne`, `$where`), dotted keys, and prototype pollution keys (`__proto__`, `constructor`, `prototype`).
  - `inspectAndSanitizeInputs`: blocks XSS vectors (`<script>`, `javascript:`, event handlers), shell command injection payloads, and path traversal sequences (`../`), and sanitizes stray HTML tags with `xss` while preserving complex password characters safely.
  - `csrfOriginGuard`: validates `Origin`/`Referer` and `Sec-Fetch-Site` on state-changing HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) against trusted origins while allowing non-browser mobile clients.
  - **CORS**: `backend/app.js` and Socket.IO in `backend/server.js` allow only trusted origins (plus no-`Origin` mobile clients) and reject/log unauthorized origins.
  - **File Uploads** (`backend/utils/fileSecurity.js`, `memoryUpload.middleware.js`, `upload.middleware.js`): rejects SVG/HTML/executable/double extensions, requires matching extension + MIME, and checks binary magic-byte signatures (`%PDF-`, PNG, JPEG, GIF, WEBP, OLE2, OOXML) before processing.

## 5. Security Monitoring, Attack Detection Dashboard & Audit Logs
- Real detected threats are stored in MongoDB (`SecurityEvent` model) with masked actor identifiers (`maskActor`) and redacted metadata (`sanitizeLogMeta` stripping passwords, JWTs, OTPs, cookies).
- **Admin Endpoints** (`SUPER_ADMIN` only):
  - `GET /api/admin/security/events`: filterable by `category`, `severity`, `status`, `search`, plus active lockouts & summary aggregates.
  - `DELETE /api/admin/security/lockouts/:id`: manual lockout clear (audit-logged).
  - `GET /api/admin/audit-logs`: searchable administrator and security activity logs (supports alphanumeric, IP, email, and status filtering; zero dummy seed entries).
- **Admin UI**: `/admin/security` (`SecurityDashboard.jsx`) and `/admin/audit-logs` (`AuditLogs.jsx`).

