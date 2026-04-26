import asyncHandler      from "../utils/asyncHandler.js";
import ApiResponse       from "../utils/ApiResponse.js";
import { healthCheckService } from "../services/healthcheck.service.js";

export const healthCheck = asyncHandler(async (_req, res) => {
  const data = await healthCheckService();
  res.status(200).json(new ApiResponse(200, data, "Server healthy"));
});