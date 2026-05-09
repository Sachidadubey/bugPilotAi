-----------------------------------------------------  @BugPilot AI   —---------------------------------------------------------------------------------

React + Vite web application for BugPilot AI. Handles JWT auth with auto-refresh, gives developers a full dashboard to submit and analyze code, manage sessions, and upgrade to Pro — all backed by the Express API.

---

## What this does

The frontend is the primary web interface for BugPilot AI. Users register, verify email via OTP, and land on a dashboard where they paste code, error messages, log files, or screenshots and receive Gemini AI analysis back in seconds. Pro users get unlimited daily analyses. Admins get a separate role-protected panel to manage users and view platform revenue and usage analytics.

---
****************************************************************************************
## Live Demo

| Platform | URL |
|----------|-----|
| 🌐 Web App | [bug-pilot-ai.vercel.app](https://bug-pilot-ai.vercel.app) |

*****************************************************************************************

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Styling | Bootstrap 5 + Bootstrap Icons |
| Routing | React Router v6 |
| HTTP client | Axios with request/response interceptors |
| Global state | React Context + useReducer |
| Notifications | React Hot Toast |
| Payments | Razorpay checkout (client-side JS SDK) |

---

## Project structure

```
bugpilot-frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js                # Axios instance, base URL from env, interceptors
│   ├── context/
│   │   └── AuthContext.jsx         # useReducer auth state, token storage, user hydration
│   ├── components/
│   │   ├── Sidebar.jsx             # NavLink active states, admin section, plan badge, logout
│   │   ├── Navbar.jsx              # Top bar with user info and plan indicator
│   │   ├── ProtectedRoute.jsx      # Redirects unauthenticated users to /login
│   │   ├── AdminRoute.jsx          # Redirects non-admins to /dashboard
│   │   └── GuestRoute.jsx          # Redirects logged-in users away from auth pages
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Register.jsx        # Password strength badges, OTP redirect
│   │   │   ├── Login.jsx           # Show/hide password, auth error display
│   │   │   ├── VerifyOtp.jsx       # 6-box OTP input, paste support, countdown resend
│   │   │   ├── ForgotPassword.jsx  # Email input, fires OTP
│   │   │   └── ResetPassword.jsx   # Email + OTP + new password
│   │   ├── Dashboard.jsx           # Stats, usage bar, recent sessions, top languages
│   │   ├── Debug.jsx               # Core AI debug page
│   │   ├── History.jsx             # Paginated session history with filters
│   │   ├── Profile.jsx             # Avatar upload, profile edit, change password
│   │   ├── Plan.jsx                # Free vs Pro cards, Razorpay checkout
│   │   ├── Billing.jsx             # Payment history, cancel subscription
│   │   └── admin/
│   │       ├── AdminDashboard.jsx  # Platform stats
│   │       ├── AdminUsers.jsx      # User table with actions
│   │       └── AdminUserDetail.jsx # Full user profile + activity
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
└── vite.config.js
```

---

## Pages

### Auth

**Register** — Name, email, password. Password strength indicator shows Weak / Fair / Strong / Very Strong in real time based on length, uppercase, numbers, and special characters. On success, redirects to OTP verification with email passed via router state.

**VerifyOtp** — Six individual input boxes auto-advance on each keystroke. Paste a 6-digit code and all boxes fill instantly. 60-second countdown before resend is enabled. Expired OTPs trigger resend-otp automatically on request.

**Login** — Email + password with show/hide toggle. Auth errors from the backend surface inline. On success, access token is stored, AuthContext is updated, and the user lands on `/dashboard`.

**ForgotPassword** — Takes email, calls forgot-password endpoint which fires an OTP to the inbox.

**ResetPassword** — Single form with email, OTP, and new password. Maps directly to the backend's reset-password endpoint.

---

### Main app

**Dashboard** — Four stat cards showing total analyses, today's count, current plan, and remaining daily quota. Usage progress bar turns red when the user is near the free tier limit. Recent sessions table shows input type, language detected, status badge, and timestamp. Top languages breakdown displayed as a simple chart.

**Debug** — The core page. Input type tabs switch between Code, Text/Error, Log, and Image. Mode tabs switch between Analyze, Fix, and Optimize — all sent to the same backend endpoint. Dark monospace textarea for code input. Drag-and-drop image upload with preview for screenshot analysis. Language selector with auto-detect or 8 manual options. On submit, loading spinner with "Analyzing with Gemini AI..." message. Results render as four cards:
- Root Cause (red left border) — with severity badge (low / medium / high / critical)
- Explanation (yellow left border)
- Solution (green left border)
- Fixed Code (purple left border) — monospace block with one-click copy button

Tags rendered as pills below result cards. Token usage count shown in the footer of each result.

**History** — Full paginated table of all debug sessions. Search by keyword. Filter by status (success/failed), input type (code/text/log/image), and language. Pagination controls at the bottom.

**Profile** — Avatar upload with instant preview before save (Cloudinary on backend). Inline edit for name, bio, and phone number. Separate change password section with current + new + confirm fields.

**Plan** — Side-by-side Free vs Pro comparison cards listing all features. Razorpay checkout button creates an order via the backend, opens the Razorpay modal, and on payment success calls `/payment/verify` to activate Pro.

**Billing** — Table of all past payments with amount, date, and status. Cancel subscription button with confirmation. After cancellation, plan reverts to Free at the end of the billing period.

---

### Admin (role-protected)

**AdminDashboard** — Total users, total analyses today, revenue this month, active Pro subscribers.

**AdminUsers** — Paginated user table with search and sort. Per-user actions: ban (immediate session kill via Redis), unban, override plan (Free ↔ Pro), delete account. Status badges show active / banned / unverified.

**AdminUserDetail** — Full profile view for any user including their debug session history and payment history.

---

## Auth architecture

```
AuthContext (useReducer)
    ↓
Axios instance — attaches Bearer token to every request
    ↓
Response interceptor — catches 401
    ↓
Calls /auth/refresh-token with HTTP-only refresh cookie
    ↓
On success — updates access token, retries original request
    ↓
On failure — dispatches LOGOUT, redirects to /login
```

Route guards wrap every protected path. `ProtectedRoute` checks for a valid token. `AdminRoute` additionally checks `user.role === 'admin'`. `GuestRoute` redirects authenticated users away from `/login` and `/register`.

---

## Setup

```bash
cd bugpilot-frontend
npm install
```

Create `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

```bash
npm run dev
```

Runs on `http://localhost:5173`.

---

## Build for production

```bash
npm run build
```

Add `vercel.json` to the frontend root before deploying to Vercel — without it, all routes except `/` return 404:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Update `.env` before building:

```
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

---

## Key decisions worth knowing

**Why useReducer instead of useState for auth?**
Auth state has multiple interdependent fields — user object, token, loading flag, error. useReducer keeps all transitions explicit and predictable. A single `LOGOUT` action clears everything atomically instead of three separate `setState` calls that could render in inconsistent intermediate states.

**Why Axios interceptors instead of manual token handling?**
Every component would need to catch 401s and trigger a refresh manually. The interceptor handles this once at the network layer — components just make API calls and never think about token expiry. The interceptor queues concurrent requests during a refresh so only one refresh call goes out even if three requests fail simultaneously.

**Why HTTP-only cookies for the refresh token?**
The refresh token never touches JavaScript. XSS attacks that exfiltrate localStorage tokens cannot steal the refresh token. The access token is short-lived (15 minutes) so the damage window for any XSS leak is limited.

---

## Author

sachida dhar  Dubey — B.Tech CSE, Technocrats Institute of Technology, Bhopal (RGPV University)
