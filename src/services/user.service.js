import mongoose from "mongoose";
import Debug    from "../models/debug.model.js";
import User     from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { getRedis }              from "../config/redis.js";
import { deleteFromCloudinary }  from "../config/cloudinary.js";

// ── Get profile ───────────────────────────────────────────────────────────────
export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select(
    "-refreshToken -loginAttempts -lockUntil"
  );
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

// ── Update profile ────────────────────────────────────────────────────────────
export const updateProfileService = async (userId, { name }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (name) user.name = name;
  await user.save({ validateBeforeSave: false });

  return await User.findById(userId).select(
    "-refreshToken -loginAttempts -lockUntil"
  );
};

// ── Usage stats ───────────────────────────────────────────────────────────────
export const getUsageStatsService = async (userId) => {
  const redis    = getRedis();
  const uid      = new mongoose.Types.ObjectId(userId);
  const today    = new Date().toISOString().split("T")[0];
  const usageKey = `usage:${userId}:${today}`;

  const [
    totalSessions,
    completedSessions,
    failedSessions,
    todayCount,
    tokenAgg,
    byType,
    byLanguage,
    recentSessions,
  ] = await Promise.all([
    Debug.countDocuments({ userId }),
    Debug.countDocuments({ userId, status: "completed" }),
    Debug.countDocuments({ userId, status: "failed"    }),
    redis.get(usageKey),
    Debug.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: null, total: { $sum: "$tokensUsed" } } },
    ]),
    Debug.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$inputType", count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
    Debug.aggregate([
      { $match: { userId: uid, language: { $ne: "unknown" } } },
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
      { $limit: 5 },
    ]),
    Debug.find({ userId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("inputType language analysis.rootCause createdAt tokensUsed"),
  ]);

  const user = await User.findById(userId).select("subscription");

  return {
    plan:              user.subscription,
    todayUsage:        parseInt(todayCount || "0"),
    dailyLimit:        user.subscription === "pro" ? null : 10,
    totalSessions,
    completedSessions,
    failedSessions,
    successRate:       totalSessions > 0
                         ? Math.round((completedSessions / totalSessions) * 100)
                         : 0,
    totalTokensUsed:   tokenAgg[0]?.total || 0,
    byInputType:       byType,
    topLanguages:      byLanguage,
    recentSessions,
  };
};

// ── Debug history with filters + pagination ───────────────────────────────────
export const getDebugHistoryService = async ({
  userId, page = 1, limit = 10,
  status, inputType, language,
  startDate, endDate, search,
}) => {
  const filter = { userId };

  if (status)    filter.status    = status;
  if (inputType) filter.inputType = inputType;
  if (language)  filter.language  = language;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { textInput:            { $regex: search, $options: "i" } },
      { "analysis.rootCause": { $regex: search, $options: "i" } },
      { "analysis.tags":      { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [sessions, total] = await Promise.all([
    Debug.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v"),
    Debug.countDocuments(filter),
  ]);

  return {
    sessions,
    pagination: {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasNext:    Number(page) < Math.ceil(total / Number(limit)),
      hasPrev:    Number(page) > 1,
    },
  };
};

// ── Get plan info ─────────────────────────────────────────────────────────────
export const getPlanInfoService = async (userId) => {
  const redis = getRedis();
  const today = new Date().toISOString().split("T")[0];
  const usageKey = `usage:${userId}:${today}`;

  const user = await User.findById(userId)
    .select("subscription name email createdAt");
  if (!user) throw new ApiError(404, "User not found");

  const todayUsage = parseInt((await redis.get(usageKey)) || "0");
  const limit      = user.subscription === "pro" ? null : 10;

  const FREE_FEATURES = [
    "10 debug sessions/day",
    "Text + code analysis",
    "Screenshot analysis",
    "Debug history (30 days)",
  ];

  const PRO_FEATURES = [
    "Unlimited debug sessions",
    "Priority AI processing",
    "Full debug history",
    "Advanced analytics",
    "API access",
  ];

  return {
    plan:        user.subscription,
    dailyLimit:  limit,
    todayUsage,
    remaining:   limit !== null ? Math.max(0, limit - todayUsage) : null,
    memberSince: user.createdAt,
    features: {
      free: FREE_FEATURES,
      pro:  PRO_FEATURES,
    },
    currentFeatures: user.subscription === "pro" ? PRO_FEATURES : FREE_FEATURES,
  };
};

// ── Delete account ────────────────────────────────────────────────────────────
export const deleteAccountService = async (userId, { password }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(400, "Password incorrect");

  // Delete Cloudinary images of all debug sessions
  const sessions = await Debug.find({
    userId,
    imagePublicId: { $ne: "" },
  });

  await Promise.allSettled(
    sessions.map((s) => deleteFromCloudinary(s.imagePublicId))
  );

  await Debug.deleteMany({ userId });
  await User.findByIdAndDelete(userId);
};