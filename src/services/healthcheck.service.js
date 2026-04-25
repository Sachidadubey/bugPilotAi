
import mongoose from "mongoose";
import { getRedis } from "../config/redis.js";

export const healthCheckService = async () => {
  const dbState = mongoose.connection.readyState === 1
    ? "connected" : "disconnected";

  let redisState = "disconnected";
  try {
    const redis = getRedis();
    await redis.set("health_ping", "ok", { ex: 10 });
    redisState = "connected";
  } catch { /* silent */ }

  return {
    status:      dbState === "connected" && redisState === "connected" ? "OK" : "DEGRADED",
    uptime:      Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
    database:    dbState,
    redis:       redisState,
    timestamp:   new Date().toISOString(),
  };
};