import asyncHandler  from "../utils/asyncHandler.js";
import ApiResponse   from "../utils/ApiResponse.js";
import * as debugSvc from "../services/debug.service.js";

export const analyzeError = asyncHandler(async (req, res) => {
  const session = await debugSvc.analyzeErrorService({
    userId:       req.user._id,
    inputType:    req.body.inputType,
    textInput:    req.body.textInput,
    language:     req.body.language,
    mode:         req.body.mode || "analyze",
    file:         req.file,
    usageKey:     req.usageKey,
    subscription: req.user.subscription,
  });
  res.status(200).json(new ApiResponse(200, session, "Analysis complete"));
});

export const getHistory = asyncHandler(async (req, res) => {
  const data = await debugSvc.getHistoryService({
    userId:    req.user._id,
    page:      req.query.page,
    limit:     req.query.limit,
    status:    req.query.status,
    inputType: req.query.inputType,
  });
  res.status(200).json(new ApiResponse(200, data, "History fetched"));
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await debugSvc.getSessionService({
    sessionId: req.params.id,
    userId:    req.user._id,
  });
  res.status(200).json(new ApiResponse(200, session, "Session fetched"));
});

export const deleteSession = asyncHandler(async (req, res) => {
  await debugSvc.deleteSessionService({
    sessionId: req.params.id,
    userId:    req.user._id,
  });
  res.status(200).json(new ApiResponse(200, null, "Session deleted"));
});

export const getUsageStats = asyncHandler(async (req, res) => {
  const stats = await debugSvc.getUsageStatsService({ userId: req.user._id });
  res.status(200).json(new ApiResponse(200, stats, "Usage stats fetched"));
});