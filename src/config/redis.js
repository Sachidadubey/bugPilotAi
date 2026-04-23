import { Redis } from "@upstash/redis";
import logger    from "./logger.js";

let redisClient;

export const connectRedis = async () => {
  redisClient = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  await redisClient.set("health", "ok");
  logger.info("Upstash Redis connected");
};

// Direct client export — no wrapper, no proxy
export const getRedis = () => {
  if (!redisClient) throw new Error("Redis not initialized");
  return redisClient;
};