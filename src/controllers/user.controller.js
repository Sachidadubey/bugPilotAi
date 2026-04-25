import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse  from "../utils/ApiResponse.js";
import * as userSvc from "../services/user.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const data = await userSvc.getProfileService(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Profile fetched"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await userSvc.updateProfileService(
    req.user._id,
    req.body,
    req.file  // multer file — optional
  );
  res.status(200).json(new ApiResponse(200, data, "Profile updated"));
});

export const getUsageStats = asyncHandler(async (req, res) => {
  const data = await userSvc.getUsageStatsService(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Usage stats fetched"));
});

export const getDebugHistory = asyncHandler(async (req, res) => {
  const data = await userSvc.getDebugHistoryService({
    userId:    req.user._id,
    page:      req.query.page,
    limit:     req.query.limit,
    status:    req.query.status,
    inputType: req.query.inputType,
    language:  req.query.language,
    startDate: req.query.startDate,
    endDate:   req.query.endDate,
    search:    req.query.search,
  });
  res.status(200).json(new ApiResponse(200, data, "History fetched"));
});

export const getPlanInfo = asyncHandler(async (req, res) => {
  const data = await userSvc.getPlanInfoService(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Plan info fetched"));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await userSvc.deleteAccountService(req.user._id, req.body);
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse(200, null, "Account deleted successfully"));
});