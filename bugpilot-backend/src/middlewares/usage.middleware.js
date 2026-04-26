import { getRedis }  from "../config/redis.js";
import ApiError      from "../utils/ApiError.js";
import asyncHandler  from "../utils/asyncHandler.js";

const PLAN_LIMITS = {
  free: 10,
  pro:  Infinity,
};

/**
 * Checks daily debug usage for the authenticated user.
 * Key: usage:<userId>:<YYYY-MM-DD> — auto-expires at midnight + 1hr
 * Must come after protect middleware — needs req.user
 */
export const checkUsageLimit = asyncHandler(async (req, _res, next) => {
  const redis  = getRedis();
  const user   = req.user;
  const limit  = PLAN_LIMITS[user.subscription] ?? PLAN_LIMITS.free;

  if (limit === Infinity) return next(); // pro — no limit check needed

  const today  = new Date().toISOString().split("T")[0]; // "2025-04-24"
  const key    = `usage:${user._id}:${today}`;

  const current = parseInt((await redis.get(key)) || "0");

  if (current >= limit) {
    throw new ApiError(
      429,
      `Daily limit reached (${limit} requests/day on free plan). Upgrade to Pro for unlimited access.`
    );
  }

  // Attach to req so service can increment without another Redis call
  req.usageKey     = key;
  req.currentUsage = current;
  next();
});

export const incrementUsage = async (usageKey) => {
  const redis = getRedis();
  // INCR is atomic — no race condition
  await redis.incr(usageKey);
  // Expire at end of day + 1hr buffer
  const secondsUntilMidnight = 86400 - (Math.floor(Date.now() / 1000) % 86400);
  await redis.expire(usageKey, secondsUntilMidnight + 3600);
};