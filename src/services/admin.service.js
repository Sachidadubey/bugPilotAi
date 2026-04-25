import mongoose from "mongoose";
import User     from "../models/user.model.js";
import Debug    from "../models/debug.model.js";
import Payment  from "../models/payment.model.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";






export const getDashboardStatsService = async () => {
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    verifiedUsers,
    bannedUsers,
    proUsers,
    freeUsers,
    newUsersToday,
    newUsersThisMonth,
    totalDebugSessions,
    debugToday,
    completedSessions,
    failedSessions,
    totalRevenue,
    revenueThisMonth,
    totalPayments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ subscription: "pro" }),
    User.countDocuments({ subscription: "free" }),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: thisMonth } }),
    Debug.countDocuments(),
    Debug.countDocuments({ createdAt: { $gte: today } }),
    Debug.countDocuments({ status: "completed" }),
    Debug.countDocuments({ status: "failed"    }),
    Payment.aggregate(
      [
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
      ]
    ),
    Payment.aggregate([
      { $match: { status: "paid", createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.countDocuments({ status: "paid" }),
  ]);

  // Token usage
  const tokenAgg = await Debug.aggregate([
    { $group: { _id: null, total: { $sum: "$tokensUsed" } } },
  ]);

  return {
    users: {
      total:          totalUsers,
      verified:       verifiedUsers,
      banned:         bannedUsers,
      pro:            proUsers,
      free:           freeUsers,
      newToday:       newUsersToday,
      newThisMonth:   newUsersThisMonth,
    },
    debug: {
      total:          totalDebugSessions,
      today:          debugToday,
      completed:      completedSessions,
      failed:         failedSessions,
      successRate:    totalDebugSessions > 0
                        ? Math.round((completedSessions / totalDebugSessions) * 100)
                        : 0,
      totalTokensUsed: tokenAgg[0]?.total || 0,
    },
    revenue: {
      total:          (totalRevenue[0]?.total || 0) / 100,    // paise → INR
      thisMonth:      (revenueThisMonth[0]?.total || 0) / 100,
      totalPayments,
    },
  };
};

// ── Get all users ─────────────────────────────────────────────────────────────
export const getAllUsersService = async ({
  page = 1, limit = 20, search,
  subscription, isVerified, isBanned,
  sortBy = "createdAt", order = "desc",
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (subscription !== undefined) filter.subscription = subscription;
  if (isVerified   !== undefined) filter.isVerified   = isVerified;
  if (isBanned     !== undefined) filter.isBanned     = isBanned;

  const skip      = (Number(page) - 1) * Number(limit);
  const sortOrder = order === "asc" ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .select("-password -refreshToken -loginAttempts"),
    User.countDocuments(filter),
  ]);

  return {
    users,
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

// ── Get single user detail ────────────────────────────────────────────────────
export const getUserDetailService = async (targetUserId) => {
  const user = await User.findById(targetUserId)
    .select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");

  const uid = new mongoose.Types.ObjectId(targetUserId);

  const [debugStats, payments, recentSessions] = await Promise.all([
    Debug.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id:         null,
          total:       { $sum: 1 },
          completed:   { $sum: { $cond: [{ $eq: ["$status","completed"] }, 1, 0] } },
          failed:      { $sum: { $cond: [{ $eq: ["$status","failed"]    }, 1, 0] } },
          totalTokens: { $sum: "$tokensUsed" },
        },
      },
    ]),
    Payment.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .select("-signature -webhookEvent"),
    Debug.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("inputType language status tokensUsed createdAt analysis.rootCause"),
  ]);

  return {
    user,
    debugStats:     debugStats[0] || { total:0, completed:0, failed:0, totalTokens:0 },
    payments,
    recentSessions,
  };
};

// ── Ban user ──────────────────────────────────────────────────────────────────
export const banUserService = async (adminId, targetUserId, { reason }) => {
  if (adminId.toString() === targetUserId) {
    throw new ApiError(400, "Cannot ban yourself");
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot ban another admin");
  if (user.isBanned) throw new ApiError(400, "User is already banned");

  user.isBanned   = true;
  user.banReason  = reason;
  user.bannedAt   = new Date();
  user.refreshToken = null; // force logout immediately
  await user.save({ validateBeforeSave: false });

  logger.warn(`Admin ${adminId} banned user ${targetUserId}: ${reason}`);
};

// ── Unban user ────────────────────────────────────────────────────────────────
export const unbanUserService = async (adminId, targetUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.isBanned) throw new ApiError(400, "User is not banned");

  user.isBanned  = false;
  user.banReason = "";
  user.bannedAt  = null;
  await user.save({ validateBeforeSave: false });

  logger.info(`Admin ${adminId} unbanned user ${targetUserId}`);
};

// ── Update user plan ──────────────────────────────────────────────────────────
export const updateUserPlanService = async (adminId, targetUserId, { subscription }) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");

  user.subscription = subscription;
  await user.save({ validateBeforeSave: false });

  logger.info(`Admin ${adminId} changed user ${targetUserId} plan to ${subscription}`);
};

// ── Delete user ───────────────────────────────────────────────────────────────
export const deleteUserService = async (adminId, targetUserId) => {
  if (adminId.toString() === targetUserId) {
    throw new ApiError(400, "Cannot delete yourself");
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot delete another admin");

  await Debug.deleteMany({ userId: targetUserId });
  await Payment.deleteMany({ userId: targetUserId });
  await User.findByIdAndDelete(targetUserId);

  logger.warn(`Admin ${adminId} deleted user ${targetUserId}`);
};

// ── Revenue analytics ─────────────────────────────────────────────────────────
export const getRevenueAnalyticsService = async () => {
  const last6Months = new Date();
  last6Months.setMonth(last6Months.getMonth() - 6);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: "paid", createdAt: { $gte: last6Months } } },
    {
      $group: {
        _id: {
          year:  { $year:  "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue:  { $sum: "$amount" },
        payments: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const formatted = monthlyRevenue.map((m) => ({
    month:    `${m._id.year}-${String(m._id.month).padStart(2,"0")}`,
    revenue:  m.revenue / 100,
    payments: m.payments,
  }));

  const totalRevenue = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);

  return {
    monthlyRevenue: formatted,
    total:          (totalRevenue[0]?.total || 0) / 100,
    totalPayments:  totalRevenue[0]?.count || 0,
  };
};

// ── AI usage analytics ────────────────────────────────────────────────────────
export const getAiUsageService = async () => {
  const [byType, byLanguage, byStatus, tokensByDay] = await Promise.all([
    Debug.aggregate([
      { $group: { _id: "$inputType", count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
    Debug.aggregate([
      { $match:  { language: { $ne: "unknown" } } },
      { $group:  { _id: "$language", count: { $sum: 1 } } },
      { $sort:   { count: -1 } },
      { $limit:  10 },
    ]),
    Debug.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Debug.aggregate([
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
            day:   { $dayOfMonth: "$createdAt" },
          },
          tokens:   { $sum: "$tokensUsed" },
          sessions: { $sum: 1 },
        },
      },
      { $sort:  { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: 30 },
    ]),
  ]);

  const totalTokens = await Debug.aggregate([
    { $group: { _id: null, total: { $sum: "$tokensUsed" } } },
  ]);

  return {
    byInputType:    byType,
    byLanguage,
    byStatus,
    totalTokensUsed: totalTokens[0]?.total || 0,
    dailyUsage:     tokensByDay.map((d) => ({
      date:     `${d._id.year}-${String(d._id.month).padStart(2,"0")}-${String(d._id.day).padStart(2,"0")}`,
      tokens:   d.tokens,
      sessions: d.sessions,
    })),
  };
};