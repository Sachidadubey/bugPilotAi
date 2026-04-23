# BugPilot AI Backend

Production-ready backend foundation for **BugPilot AI** — an AI-powered debugging SaaS platform built with Node.js, Express, MongoDB Atlas, and Upstash Redis.

This repository currently contains the **core infrastructure layer** and is structured for future modules such as authentication, AI debugging engine, payments, admin dashboard, and browser/editor extensions.

---

## 🚀 Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Upstash Redis
* Winston Logger
* Helmet
* CORS
* Compression
* Express Rate Limit
* Nodemon

---

## 📁 Project Structure

```txt
bugpilot-backend/
│── src/
│   ├── app.js
│   ├── server.js
│
│   ├── config/
│   │   ├── db.js
│   │   ├── redis.js
│   │   └── logger.js
│
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   └── utils/
│
│── .env
│── package.json
│── README.md
```

---

## ✅ Current Features

### Core Backend Infrastructure

* Express server setup
* MongoDB Atlas connection
* Upstash Redis connection
* Winston logging system
* Security middleware with Helmet
* Global rate limiting
* CORS configuration
* Compression enabled
* Environment variable management
* Health check API

---

## 🌐 API Endpoint

### Health Check

```http
GET /api/v1/health
```

### Example Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server healthy"
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in root directory:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_uri

UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

---

## ▶️ Run Locally

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## 🧠 Upcoming Modules

### Module 2 — Authentication

* Register / Login
* JWT Access Token
* Refresh Token
* OTP Email Verification
* Forgot / Reset Password
* Roles & Subscription Plans

### Module 3 — AI Debug Engine

* Analyze code
* Fix bugs
* Explain errors
* Optimize code
* Screenshot debugging
* File/log uploads

### Module 4 — Payments

* Razorpay subscriptions
* Billing history
* Webhooks

### Module 5 — Admin Dashboard

* User management
* Analytics
* Revenue stats
* AI usage logs

### Module 6 — Extensions

* VS Code Extension
* Chrome Extension

---

## 📌 Goal

Build a real-world AI SaaS product that solves debugging problems for developers and demonstrates production-grade backend engineering.

---

## 👨‍💻 Author

sachida Dubey

---
