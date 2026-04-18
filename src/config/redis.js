import { Redis } from "@upstash/redis";
import logger from "./logger.js";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const testRedis = async () => {
  try {
    await redis.set("health", "ok");
    logger.info("Upstash Redis Connected");
  } catch (error) {
    logger.error(`Redis Error: ${error.message}`);
  }
};

testRedis();

export default redis;