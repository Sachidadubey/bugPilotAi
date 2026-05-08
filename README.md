# BugPilot AI

AI-powered debugging platform. Paste your error, get the root cause and fix. Available as a web app, Chrome extension, and VS Code extension — built as a production SaaS with subscription tiers, admin controls, and multi-platform support.

## What this does

Developers waste hours debugging. BugPilot AI takes your error message, code snippet, log file, or screenshot — sends it to Gemini AI — and returns the root cause, explanation, fix, and corrected code in seconds.

Free tier: 10 analyses per day. Pro tier: unlimited.

---

## Repository structure

```
bugPilotAi/
├── bugpilot-backend/       # Node.js + Express REST API
├── bugpilot-frontend/      # React + Vite web application
├── chrome-extension/       # Manifest V3 Chrome side panel extension
└── vscode-extension/       # VS Code sidebar webview extension
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Cache / OTP store | Upstash Redis |
| AI | Google Gemini 2.0 Flash Lite |
| File storage | Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Logger | Winston |
| Auth | JWT (access + refresh token rotation) |
| Frontend | React 18 + Vite + Bootstrap 5 |
| HTTP client | Axios (interceptors + auto-refresh on 401) |
| Chrome extension | Manifest V3, Side Panel API |
| VS Code extension | VS Code Extension API, Webview |

---

## What is built

### Backend — 7 

**Module 1 — Foundation**
Express setup, MongoDB + Redis connection, Winston logger, Helmet, CORS, rate limiting, health check, global error handler.

**Module 2 — Authentication**
Register, login, logout, JWT access + refresh token rotation, HTTP-only cookies, role-based access control, subscription middleware.

**Module 3 — Advanced Auth**
Email OTP verification (Redis TTL, SHA-256 hashed), resend OTP with spam protection, forgot password via OTP, reset password, change password, account lock after 5 failed attempts (15-min lockout).

**Module 4 — AI Debug Engine**
Submit code / text / log / screenshot → Gemini AI → root cause + explanation + fix + corrected code + severity + tags + references. Cloudinary for screenshot storage. Daily usage limits via Redis atomic counters. Session history saved to MongoDB.

**Module 5 — Dashboard APIs**
User profile with avatar upload, usage stats with aggregation, debug history with search + filter + pagination, plan info, delete account.

**Module 6 — Payments**
Razorpay order creation, HMAC-SHA256 signature verification, webhook handling (raw body before JSON middleware), pro plan activation, billing history, cancellation.

**Module 7 — Admin Panel**
Platform stats, user management with search/filter/sort, ban/unban (immediate session invalidation), manual plan override, delete user, monthly revenue analytics, AI usage analytics.

---

### Frontend — React + Bootstrap 5

**Auth pages** — Register with password strength indicator, Login with show/hide toggle, VerifyOtp (6-box input with paste support + countdown resend), ForgotPassword, ResetPassword.

**Dashboard** — Usage stat cards, progress bar, recent sessions table, top languages chart.

**Debug page** — Input type tabs (Code / Text / Log / Image), mode tabs (Analyze / Fix / Optimize), drag-drop image upload, result cards showing root cause / explanation / solution / fixed code / severity badge / tags / copy button.

**History page** — Paginated table with search, status, input type, and language filters.

**Profile page** — Avatar upload with preview, name/bio/phone editing, change password section.

**Plan page** — Free vs Pro comparison cards, Razorpay checkout integration.

**Billing page** — Payment history table, cancel subscription.

**Admin pages** — Stats dashboard, user table with ban/unban/plan/delete actions, user detail view.

Auth architecture: `AuthContext` with `useReducer`, Axios interceptors with auto-refresh on 401, `ProtectedRoute` / `AdminRoute` / `GuestRoute` guards.

---

### Chrome Extension — Manifest V3

Side panel (not popup) that opens on icon click. Login with token stored in `chrome.storage.local`. Analyze code, text, or logs from any webpage. Right-click context menu on selected text to analyze instantly. Page Errors tab captures `console.error`, `window.onerror`, and unhandled promise rejections. Background service worker handles all API calls.

---

### VS Code Extension

Sidebar webview panel with VS Code dark theme. Analyze / Fix / Optimize mode buttons. Right-click on selected code → "BugPilot AI: Analyze selected code". API token and URL configurable via VS Code settings. Result cards with color-coded left borders by severity.

---

## Running locally

### Backend

```bash
cd bugpilot-backend
npm install
npm run dev
```

Runs on `http://localhost:5000`. See `bugpilot-backend/README.md` for full environment variables list.

### Frontend

```bash
cd bugpilot-frontend
npm install
npm run dev
```

Create `bugpilot-frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Runs on `http://localhost:5173`.

### Chrome Extension

1. Open `chrome://extensions` in Chrome
2. Enable Developer Mode
3. Click Load unpacked → select `chrome-extension/` folder
4. Click the BugPilot icon in the toolbar

### VS Code Extension

1. Open `vscode-extension/` in VS Code
2. Press `F5` to launch Extension Development Host

---

## Key decisions worth knowing

**Why a side panel instead of a popup for the Chrome extension?**
Popups close the moment you click outside them — unusable for a debugging tool where you need to switch between the panel and your code. The Chrome Side Panel API (Manifest V3) keeps the panel open persistently while you work.

**Why Redis for OTP instead of MongoDB?**
Redis TTL deletes the key exactly at expiry. MongoDB TTL index runs every 60 seconds — not precise enough for security tokens. OTPs are also hashed (SHA-256) before storage so a Redis breach cannot be used directly.

**Why two JWT tokens?**
Access token lives 15 minutes — limits damage window if intercepted. Refresh token lives 7 days and is stored in the database so it can be revoked server-side on logout or compromise. This is the OAuth 2.0 token rotation pattern.

**Why controller → service separation?**
Controllers only handle HTTP — read from req, call one service, write to res. Services hold all business logic and database calls. This makes services independently testable and reusable from queues or cron jobs without needing an HTTP context.

**Why lazy initialization for Redis/Cloudinary/Gemini?**
ES Module imports are hoisted — they execute before `dotenv.config()` runs. Initializing clients at the top level means `process.env` is undefined. Lazy init ensures environment variables are always loaded before any external client is created.

---

## Roadmap

- [ ] Jest + Supertest test suite
- [ ] Swagger / OpenAPI documentation
- [ ] Docker containerization
- [ ] Deploy frontend on Vercel

---

## Author

Ankush Dubey — B.Tech CSE, Technocrats Institute of Technology, Bhopal (RGPV University)
