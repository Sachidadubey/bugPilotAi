import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import debugRoutes from "./routes/debug.routes.js";

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

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/debug", debugRoutes);
app.use("/api/v1/payment",  paymentRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;