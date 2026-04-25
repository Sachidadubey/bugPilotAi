import asyncHandler   from "../utils/asyncHandler.js";
import ApiResponse    from "../utils/ApiResponse.js";
import * as adminSvc  from "../services/admin.service.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const data = await adminSvc.getDashboardStatsService();
  res.status(200).json(new ApiResponse(200, data, "Dashboard stats fetched"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const data = await adminSvc.getAllUsersService(req.query);
  res.status(200).json(new ApiResponse(200, data, "Users fetched"));
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const data = await adminSvc.getUserDetailService(req.params.userId);
  res.status(200).json(new ApiResponse(200, data, "User detail fetched"));
});

export const banUser = asyncHandler(async (req, res) => {
  await adminSvc.banUserService(req.user._id, req.params.userId, req.body);
  res.status(200).json(new ApiResponse(200, null, "User banned successfully"));
});

export const unbanUser = asyncHandler(async (req, res) => {
  await adminSvc.unbanUserService(req.user._id, req.params.userId);
  res.status(200).json(new ApiResponse(200, null, "User unbanned successfully"));
});

export const updateUserPlan = asyncHandler(async (req, res) => {
  await adminSvc.updateUserPlanService(req.user._id, req.params.userId, req.body);
  res.status(200).json(new ApiResponse(200, null, "User plan updated"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminSvc.deleteUserService(req.user._id, req.params.userId);
  res.status(200).json(new ApiResponse(200, null, "User deleted"));
});

export const getRevenueAnalytics = asyncHandler(async (_req, res) => {
  const data = await adminSvc.getRevenueAnalyticsService();
  res.status(200).json(new ApiResponse(200, data, "Revenue analytics fetched"));
});

export const getAiUsage = asyncHandler(async (_req, res) => {
  const data = await adminSvc.getAiUsageService();
  res.status(200).json(new ApiResponse(200, data, "AI usage fetched"));
});