# BugPilot AI — API Documentation

> **Base URL:** `http://localhost:5000/api/v1`  
> **Production:** `https://your-domain.com/api/v1`

All responses follow a consistent format:

```json
// Success
{ "success": true, "statusCode": 200, "message": "...", "data": {} }

// Error
{ "success": false, "statusCode": 400, "message": "...", "errors": [] }
```

**Authentication:** Protected routes require `Authorization: Bearer <accessToken>` header or `accessToken` cookie (set automatically on login).

---

## Table of Contents

- [Health Check](#health-check)
- [Authentication](#authentication)
- [AI Debug Engine](#ai-debug-engine)
- [User / Dashboard](#user--dashboard)
- [Payments](#payments)
- [Admin](#admin)
- [Error Codes](#error-codes)

---

## Health Check

### `GET /health`

Check server status — MongoDB + Redis connectivity.

**No authentication required.**

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server healthy",
  "data": {
    "status": "OK",
    "uptime": 3842,
    "environment": "development",
    "database": "connected",
    "redis": "connected",
    "timestamp": "2026-04-26T00:00:00.000Z"
  }
}
```

---

## Authentication

### `POST /auth/register`

Register a new user account. Sends OTP to email immediately after registration.

**No authentication required.**

**Request Body**

```json
{
  "name": "Ankush Dubey",
  "email": "user@gmail.com",
  "password": "Test1234"
}
```

| Field    | Type   | Rules                              |
| -------- | ------ | ---------------------------------- |
| name     | string | min 2, max 50 characters           |
| email    | string | valid email format                 |
| password | string | min 8 chars, 1 uppercase, 1 number |

**Response `201`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registered. Check email for OTP.",
  "data": null
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 409 | Email already registered |
| 400 | password must contain at least one uppercase letter and one number |

---

### `POST /auth/verify-otp`

Verify email address using OTP received in inbox. Required before login.

**No authentication required.**

**Request Body**

```json
{
  "email": "user@gmail.com",
  "otp": "847291"
}
```

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": null
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | OTP expired. Request a new one. |
| 400 | Invalid OTP |
| 429 | Too many OTP attempts. Request a new OTP. |

> OTP expires after **10 minutes**. Maximum **5 attempts** before lockout.

---

### `POST /auth/resend-otp`

Resend verification OTP. Has spam protection — cannot resend within 60 seconds of previous OTP.

**No authentication required.**

**Request Body**

```json
{
  "email": "user@gmail.com"
}
```

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP resent to your email",
  "data": null
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | Email already verified |
| 404 | No account found with this email |
| 429 | OTP already sent. Wait 60 seconds before resending. |

---

### `POST /auth/login`

Login and receive JWT access + refresh tokens.

**No authentication required.**

**Request Body**

```json
{
  "email": "user@gmail.com",
  "password": "Test1234"
}
```

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "69ea9d1f2a4a18e52d36acaf",
      "name": "Ankush Dubey",
      "email": "user@gmail.com",
      "role": "user",
      "subscription": "free",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies Set Automatically**

```
accessToken  — httpOnly, secure, sameSite:strict, maxAge: 15 minutes
refreshToken — httpOnly, secure, sameSite:strict, maxAge: 7 days
```

**Error Responses**
| Status | Message |
|--------|---------|
| 401 | Invalid credentials. 4 attempts left. |
| 423 | Account locked. Try again in 14 minutes. |
| 403 | Email not verified. Check your inbox. |

> Account locks for **15 minutes** after **5 consecutive failed attempts**.

---

### `GET /auth/me`

Get currently authenticated user profile.

**🔒 Protected**

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current user",
  "data": {
    "_id": "69ea9d1f2a4a18e52d36acaf",
    "name": "Ankush Dubey",
    "email": "user@gmail.com",
    "role": "user",
    "subscription": "free",
    "isVerified": true,
    "bio": "",
    "phone": "",
    "avatar": { "url": "", "public_id": "" },
    "createdAt": "2026-04-24T10:00:00.000Z"
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 401 | Access token required |
| 401 | Token expired |

---

### `POST /auth/refresh-token`

Get a new access token using the refresh token. Implements token rotation — old refresh token is invalidated.

**No authentication required.**

**Request** — cookie sent automatically OR body:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 401 | Refresh token missing |
| 401 | Refresh token reuse detected |
| 401 | Invalid or expired refresh token |

---

### `POST /auth/forgot-password`

Send password reset OTP to email.

**No authentication required.**

**Request Body**

```json
{
  "email": "user@gmail.com"
}
```

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "If this email exists, a password reset OTP has been sent",
  "data": null
}
```

> Always returns `200` regardless of whether the email exists — prevents user enumeration attacks.

---

### `POST /auth/reset-password`

Reset password using OTP received in email. Invalidates all existing sessions.

**No authentication required.**

**Request Body**

```json
{
  "email": "user@gmail.com",
  "otp": "284719",
  "password": "NewPass1234"
}
```

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully. Please log in.",
  "data": null
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | OTP expired. Request a new one. |
| 400 | Invalid OTP |

> On success, all existing sessions are invalidated across all devices.

---

### `POST /auth/change-password`

Change password while logged in. Invalidates all sessions.

**🔒 Protected**

**Request Body**

```json
{
  "currentPassword": "Test1234",
  "newPassword": "NewPass5678"
}
```

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed. Please log in again.",
  "data": null
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | Current password incorrect |

---

### `POST /auth/logout`

Logout, clear cookies, invalidate refresh token.

**🔒 Protected**

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out",
  "data": null
}
```

---

## AI Debug Engine

### `POST /debug/analyze`

Submit error, code, log, or screenshot for AI analysis.

**🔒 Protected + Email Verified**

**Request — Text/Code (JSON)**

```json
{
  "inputType": "code",
  "textInput": "const x = null; console.log(x.name);",
  "language": "javascript",
  "mode": "analyze"
}
```

**Request — Image (form-data)**

```
inputType  →  image
file       →  <screenshot file — jpeg/png/webp, max 5MB>
```

| Field     | Type   | Values                                                              |
| --------- | ------ | ------------------------------------------------------------------- |
| inputType | string | `text` `code` `log` `image`                                         |
| textInput | string | Required for text/code/log, min 5 chars                             |
| language  | string | `javascript` `typescript` `python` `java` `go` `rust` `php` `other` |
| mode      | string | `analyze` `fix` `optimize` (default: analyze)                       |

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Analysis complete",
  "data": {
    "_id": "69ebb94eb87813fc76a06adb",
    "userId": "69ea9d1f2a4a18e52d36acaf",
    "inputType": "code",
    "textInput": "const x = null; console.log(x.name);",
    "language": "javascript",
    "status": "completed",
    "tokensUsed": 612,
    "analysis": {
      "rootCause": "Attempting to access a property on a null value",
      "explanation": "In JavaScript, null is a primitive value...",
      "solution": "Use optional chaining: x?.name",
      "codeSnippet": "const x = null;\nconsole.log(x?.name);",
      "severity": "high",
      "tags": ["TypeError", "null", "optional chaining"],
      "references": [
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining"
      ]
    },
    "createdAt": "2026-04-24T18:41:18.393Z",
    "updatedAt": "2026-04-24T18:41:24.658Z"
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 429 | Daily limit reached (10 requests/day on free plan). Upgrade to Pro for unlimited access. |
| 400 | inputType is required |
| 400 | Image file required for image input type |
| 502 | AI service error. Please try again. |
| 503 | AI service not initialized |

> **Free plan:** 10 analyses/day — resets at midnight. **Pro plan:** Unlimited.

---

### `GET /debug/history`

Get paginated debug session history with optional filters.

**🔒 Protected + Email Verified**

**Query Parameters**

```
page      → number   (default: 1)
limit     → number   (default: 10)
status    → pending | processing | completed | failed
inputType → text | code | image | log
```

**Example**

```
GET /debug/history?page=1&limit=5&status=completed&inputType=code
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "_id": "69ebb94eb87813fc76a06adb",
        "inputType": "code",
        "language": "javascript",
        "status": "completed",
        "tokensUsed": 612,
        "analysis": { "rootCause": "...", "severity": "high" },
        "createdAt": "2026-04-24T18:41:18.393Z"
      }
    ],
    "pagination": {
      "total": 24,
      "page": 1,
      "limit": 5,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### `GET /debug/stats`

Get personal debug usage statistics.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "total": 24,
    "completed": 22,
    "failed": 2,
    "todayCount": 3,
    "totalTokensUsed": 8400
  }
}
```

---

### `GET /debug/:id`

Get a single debug session by ID.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "69ebb94eb87813fc76a06adb",
    "analysis": { "rootCause": "...", "solution": "...", "codeSnippet": "..." },
    "status": "completed"
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 404 | Debug session not found |

---

### `DELETE /debug/:id`

Delete a debug session. Also removes image from Cloudinary if applicable.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Session deleted",
  "data": null
}
```

---

## User / Dashboard

### `GET /user/profile`

Get full user profile.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "69ea9d1f2a4a18e52d36acaf",
    "name": "Ankush Dubey",
    "email": "user@gmail.com",
    "role": "user",
    "subscription": "free",
    "isVerified": true,
    "bio": "Backend developer",
    "phone": "9876543210",
    "avatar": {
      "url": "https://res.cloudinary.com/...",
      "public_id": "bugpilot/avatars/..."
    },
    "createdAt": "2026-04-24T10:00:00.000Z"
  }
}
```

---

### `PATCH /user/profile`

Update profile fields and/or avatar image.

**🔒 Protected + Email Verified**

**Request — JSON (no avatar)**

```json
{
  "name": "Ankush Dubey",
  "bio": "Backend developer",
  "phone": "9876543210"
}
```

**Request — form-data (with avatar)**

```
name   →  Ankush Dubey
bio    →  Backend developer
phone  →  9876543210
avatar →  <image file — jpeg/png/webp, max 5MB>
```

**Response `200`** — returns updated user object

> Old avatar is automatically deleted from Cloudinary when a new one is uploaded.

---

### `GET /user/stats`

Get detailed usage analytics.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "plan": "free",
    "todayUsage": 3,
    "dailyLimit": 10,
    "totalSessions": 24,
    "completedSessions": 22,
    "failedSessions": 2,
    "successRate": 91,
    "totalTokensUsed": 8400,
    "byInputType": [
      { "_id": "code", "count": 18 },
      { "_id": "image", "count": 6 }
    ],
    "topLanguages": [
      { "_id": "javascript", "count": 14 },
      { "_id": "python", "count": 4 }
    ],
    "recentSessions": [
      {
        "inputType": "code",
        "language": "javascript",
        "analysis.rootCause": "Null reference error",
        "tokensUsed": 612,
        "createdAt": "2026-04-24T18:41:18.393Z"
      }
    ]
  }
}
```

---

### `GET /user/history`

Debug history with advanced filtering, search, and pagination.

**🔒 Protected + Email Verified**

**Query Parameters**

```
page       → number
limit      → number
status     → pending | processing | completed | failed
inputType  → text | code | image | log
language   → javascript | python | java | ...
startDate  → 2026-01-01
endDate    → 2026-04-30
search     → searches textInput + rootCause + tags
```

**Example**

```
GET /user/history?search=null&language=javascript&page=1&limit=10
```

---

### `GET /user/plan`

Get current plan info, limits, and features.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "plan": "free",
    "dailyLimit": 10,
    "todayUsage": 3,
    "remaining": 7,
    "memberSince": "2026-04-24T10:00:00.000Z",
    "features": {
      "free": [
        "10 debug sessions/day",
        "Text + code analysis",
        "Screenshot analysis",
        "Debug history (30 days)"
      ],
      "pro": [
        "Unlimited debug sessions",
        "Priority AI processing",
        "Full debug history",
        "Advanced analytics",
        "API access"
      ]
    },
    "currentFeatures": [
      "10 debug sessions/day",
      "Text + code analysis",
      "Screenshot analysis",
      "Debug history (30 days)"
    ]
  }
}
```

---

### `DELETE /user/account`

Permanently delete account, all debug sessions, and Cloudinary files.

**🔒 Protected + Email Verified**

**Request Body**

```json
{
  "password": "Test1234"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": null
}
```

> **Irreversible.** Deletes all debug sessions, Cloudinary images, and the user document permanently.

---

## Payments

### `POST /payment/order`

Create a Razorpay payment order to initiate checkout.

**🔒 Protected + Email Verified**

**Request Body**

```json
{
  "plan": "pro"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "orderId": "order_PxxxxxxxxX",
    "amount": 49900,
    "currency": "INR",
    "description": "BugPilot AI — Pro Plan (1 Month)",
    "keyId": "rzp_test_xxxxxxxx",
    "user": {
      "name": "Ankush Dubey",
      "email": "user@gmail.com"
    }
  }
}
```

> `amount` is in **paise** (₹499 = 49900 paise). Pass `orderId` + `keyId` to Razorpay checkout.

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | You are already on the Pro plan |

---

### `POST /payment/verify`

Verify Razorpay payment signature and activate Pro plan.

**🔒 Protected + Email Verified**

**Request Body** _(values from Razorpay checkout callback)_

```json
{
  "razorpay_order_id": "order_PxxxxxxxxX",
  "razorpay_payment_id": "pay_PxxxxxxxxX",
  "razorpay_signature": "hmac_sha256_signature_string"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Payment verified. Pro plan activated!",
  "data": {
    "plan": "pro",
    "subscribedAt": "2026-04-26T00:00:00.000Z",
    "expiresAt": "2026-05-26T00:00:00.000Z",
    "paymentId": "pay_PxxxxxxxxX"
  }
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | Payment verification failed — invalid signature |
| 400 | Payment already processed |

> Signature is verified using **HMAC-SHA256**. Tampered requests are rejected. Pro activation confirmation email is sent automatically.

---

### `POST /payment/webhook`

Razorpay webhook endpoint. Handles `payment.captured` and `payment.failed` events.

**⚠ No authentication — raw body required**

**Headers**

```
x-razorpay-signature: <razorpay_webhook_signature>
Content-Type: application/json
```

**Handled Events**
| Event | Action |
|-------|--------|
| payment.captured | Activate pro plan for user |
| payment.failed | Mark payment as failed in DB |

---

### `GET /payment/billing`

Get payment and billing history.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "orderId": "order_PxxxxxxxxX",
      "paymentId": "pay_PxxxxxxxxX",
      "plan": "pro",
      "amount": 49900,
      "status": "paid",
      "subscribedAt": "2026-04-26T00:00:00.000Z",
      "expiresAt": "2026-05-26T00:00:00.000Z",
      "createdAt": "2026-04-26T00:00:00.000Z"
    }
  ]
}
```

---

### `DELETE /payment/cancel`

Cancel Pro subscription — downgrade to free plan.

**🔒 Protected + Email Verified**

**Response `200`**

```json
{
  "success": true,
  "message": "Subscription cancelled. You are now on free plan.",
  "data": null
}
```

---

## Admin

> All admin routes require `role: "admin"` in JWT. Non-admin users receive `403 Forbidden`.

### `GET /admin/stats`

Platform-wide dashboard statistics.

** Admin only**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "verified": 142,
      "banned": 3,
      "pro": 28,
      "free": 122,
      "newToday": 5,
      "newThisMonth": 38
    },
    "debug": {
      "total": 2840,
      "today": 142,
      "completed": 2700,
      "failed": 140,
      "successRate": 95,
      "totalTokensUsed": 1284000
    },
    "revenue": {
      "total": 13972,
      "thisMonth": 2994,
      "totalPayments": 28
    }
  }
}
```

---

### `GET /admin/revenue`

Monthly revenue analytics — last 6 months.

** Admin only**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "monthlyRevenue": [
      { "month": "2026-01", "revenue": 1995, "payments": 4 },
      { "month": "2026-02", "revenue": 2493, "payments": 5 },
      { "month": "2026-03", "revenue": 2992, "payments": 6 }
    ],
    "total": 13972,
    "totalPayments": 28
  }
}
```

---

### `GET /admin/ai-usage`

AI usage analytics — by input type, language, status, and daily token usage.

** Admin only**

---

### `GET /admin/users`

All users with search, filter, sort, and pagination.

** Admin only**------------------

**Query Parameters**

```
page         → number (default: 1)
limit        → number (default: 20, max: 100)
search       → searches name + email
subscription → free | pro
isVerified   → true | false
isBanned     → true | false
sortBy       → createdAt | name | email (default: createdAt)
order        → asc | desc (default: desc)
```

**Example**

```
GET /admin/users?search=ankush&subscription=pro&page=1&limit=20
```

---

### `GET /admin/users/:userId`

Full user detail — profile + debug statistics + payment history + recent sessions.

** Admin only**-----------------

**Response `200`**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "...",
      "email": "...",
      "subscription": "free"
    },
    "debugStats": {
      "total": 24,
      "completed": 22,
      "failed": 2,
      "totalTokens": 8400
    },
    "payments": [{ "orderId": "...", "status": "paid", "amount": 49900 }],
    "recentSessions": [{ "inputType": "code", "status": "completed" }]
  }
}
```

---

### `PATCH /admin/users/:userId/ban`

Ban a user — immediately invalidates all sessions.

** Admin only**------------------

**Request Body**

```json
{
  "reason": "Violation of terms of service"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "User banned successfully",
  "data": null
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | Cannot ban yourself |
| 403 | Cannot ban another admin |
| 400 | User is already banned |

---

### `PATCH /admin/users/:userId/unban`

Unban a previously banned user.

** Admin only**--------------

**Response `200`**

```json
{
  "success": true,
  "message": "User unbanned successfully",
  "data": null
}
```

---

### `PATCH /admin/users/:userId/plan`

Manually override a user's subscription plan.

** Admin only**--------------

**Request Body**

```json
{
  "subscription": "pro"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "User plan updated",
  "data": null
}
```

---

### `DELETE /admin/users/:userId`

Permanently delete a user and all their data.

** Admin only**-----------

**Response `200`**

```json
{
  "success": true,
  "message": "User deleted",
  "data": null
}
```

**Error Responses**
| Status | Message |
|--------|---------|
| 400 | Cannot delete yourself |
| 403 | Cannot delete another admin |

---

## Error Codes

| Code | Meaning               | When Used                                       |
| ---- | --------------------- | ----------------------------------------------- |
| 200  | OK                    | Successful request                              |
| 201  | Created               | Register, create order                          |
| 400  | Bad Request           | Validation error, wrong OTP, incorrect password |
| 401  | Unauthorized          | Missing / expired / invalid access token        |
| 402  | Payment Required      | Feature requires Pro plan                       |
| 403  | Forbidden             | Wrong role, unverified email, banned account    |
| 404  | Not Found             | User, session, or route not found               |
| 409  | Conflict              | Email already registered                        |
| 422  | Unprocessable Entity  | Mongoose schema validation failed               |
| 423  | Locked                | Account locked after 5 failed login attempts    |
| 429  | Too Many Requests     | Daily debug limit reached, OTP spam, rate limit |
| 500  | Internal Server Error | Unhandled server error — check server logs      |
| 502  | Bad Gateway           | Gemini AI API error or timeout                  |
| 503  | Service Unavailable   | AI or Redis client not initialized              |

---

## Rate Limits

| Endpoint Group          | Limit                     |
| ----------------------- | ------------------------- |
| Global                  | 200 requests / 15 minutes |
| Auth routes (`/auth/*`) | 10 requests / 15 minutes  |
| Debug free plan         | 10 analyses / day         |
| Debug Pro plan          | Unlimited                 |

---

## Razorpay Test Cards

Use these during development with test keys:

| Card Number         | Result  |
| ------------------- | ------- |
| 4111 1111 1111 1111 | Success |
| 5267 3181 8797 5449 | Success |

- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** `1234` for success, `2222` for failure

---

_Built by Sachida dhar Dubey — BugPilot AI v1.0_
