import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
// import mongoSanitize from "express-mongo-sanitize";// Prevent NoSQL injection
// import hpp           from "hpp";  Prevent HTTP Parameter Pollution
import debugRoutes from "./routes/debug.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js"; 
import userRoutes from "./routes/user.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(globalLimiter);




//  Webhook needs raw body ─────────────────────────────────────────
// This MUST come before express.json()
app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }),
  (req, _res, next) => {
    req.rawBody = req.body.toString("utf8");
    next();
  }
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
// app.use(mongoSanitize()); // NoSQL injection prevent
// app.use(hpp());    // HTTP Parameter Pollution prevent

// Stricter rate limit for auth routes to prevent brute-force
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many auth attempts. Try in 15 minutes." },
});

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth",authLimiter, authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/debug", debugRoutes);
app.use("/api/v1/payment",  paymentRoutes);
app.use("/api/v1/admin", adminRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

export default app;