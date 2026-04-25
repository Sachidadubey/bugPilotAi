# BugPilot AI — Backend

AI-powered debugging platform. Paste your error, get the root cause and fix. Built as a production SaaS with subscription tiers, admin controls, and multi-platform support (web, Chrome extension, VS Code extension).

---

## What this does

Developers waste hours debugging. BugPilot AI takes your error message, code snippet, log file, or screenshot — sends it to Gemini AI — and returns the root cause, explanation, fix, and corrected code in seconds.

Free tier: 10 analyses per day. Pro tier: unlimited.

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Cache / OTP store | Upstash Redis |
| AI | Google Gemini 2.5 Flash |
| File storage | Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Logger | Winston |
| Auth | JWT (access + refresh token rotation) |

---

## Project structure

```
src/
├── config/          # DB, Redis, Gemini, Cloudinary, Razorpay, Logger, Email
├── controllers/     # HTTP layer only — no business logic
├── services/        # All business logic lives here
├── models/          # Mongoose schemas with hooks and indexes
├── routes/          # Route definitions
├── middlewares/     # Auth, validation, upload, usage limit, error handler
├── validators/      # Joi schemas for every request
├── utils/           # ApiError, ApiResponse, asyncHandler, token, OTP, prompts
└── jobs/            # Background jobs — subscription expiry, temp file cleanup
```

---

## Modules built

### Module 1 — Foundation
Express setup, MongoDB + Redis connection, Winston logger, Helmet, CORS, rate limiting, health check, global error handler.

### Module 2 — Authentication
Register, login, logout, JWT access + refresh token rotation, HTTP-only cookies, role-based access control, subscription middleware.

### Module 3 — Advanced Auth
Email OTP verification (Redis TTL, SHA-256 hashed), resend OTP with spam protection, forgot password via OTP, reset password, change password, login attempt tracking, account lock after 5 failed attempts (15 min lockout).

### Module 4 — AI Debug Engine
Submit code/text/log/screenshot → Gemini AI analysis → root cause + explanation + fix + corrected code + severity + references. Cloudinary for screenshot storage. Daily usage limits enforced via Redis atomic counters. Session history saved to MongoDB.

### Module 5 — Dashboard APIs
User profile with avatar upload, usage stats with aggregation, debug history with search + filter + pagination, plan info, delete account.

### Module 6 — Payments
Razorpay order creation, payment signature verification, webhook handling (raw body), pro plan activation, billing history, subscription cancellation.

### Module 7 — Admin Panel
Dashboard stats, all users with search/filter/sort, user detail with debug + payment history, ban/unban users (immediate session invalidation), manual plan override, delete user, revenue analytics (monthly), AI usage analytics.

---

## API routes

```
GET    /api/v1/health

POST   /api/v1/auth/register
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/resend-otp
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/change-password
GET    /api/v1/auth/me

POST   /api/v1/debug/analyze
GET    /api/v1/debug/history
GET    /api/v1/debug/stats
GET    /api/v1/debug/:id
DELETE /api/v1/debug/:id

GET    /api/v1/user/profile
PATCH  /api/v1/user/profile
GET    /api/v1/user/stats
GET    /api/v1/user/history
GET    /api/v1/user/plan
DELETE /api/v1/user/account

POST   /api/v1/payment/order
POST   /api/v1/payment/verify
POST   /api/v1/payment/webhook
GET    /api/v1/payment/billing
DELETE /api/v1/payment/cancel

GET    /api/v1/admin/stats
GET    /api/v1/admin/revenue
GET    /api/v1/admin/ai-usage
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:userId
PATCH  /api/v1/admin/users/:userId/ban
PATCH  /api/v1/admin/users/:userId/unban
PATCH  /api/v1/admin/users/:userId/plan
DELETE /api/v1/admin/users/:userId
```

---

## Environment variables

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

MONGO_URI=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=
SMTP_PASSWORD=

GEMINI_API_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

## Run locally

```bash
# Install
npm install

# Development
npm run dev

# Production
npm start
```

---

## Key decisions worth knowing

**Why Redis for OTP instead of MongoDB?**
Redis TTL deletes the key exactly at expiry. MongoDB TTL index runs every 60 seconds — not precise enough for security tokens. OTPs are also hashed (SHA-256) before storage so a Redis breach can't be used directly.

**Why two JWT tokens?**
Access token lives 15 minutes — limits damage window if intercepted. Refresh token lives 7 days and is stored in the database so it can be revoked server-side on logout or compromise. This is the OAuth 2.0 token rotation pattern.

**Why controller → service separation?**
Controllers only handle HTTP — read from req, call one service, write to res. Services hold all business logic and database calls. This makes services independently testable and reusable from queues or cron jobs without needing an HTTP context.

**Why lazy initialization for Redis/Cloudinary/Gemini?**
ES Module imports are hoisted — they execute before dotenv.config() runs. Initializing clients at the top level means process.env is undefined. Lazy init (creating clients inside functions called after server startup) ensures environment variables are always loaded.

---

## Author

Sachida Dubey
B.Tech CSE — Technocrats Institute of Technology, Bhopal
