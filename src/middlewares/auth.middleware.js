import jwt  from "jsonwebtoken";
import asyncHandler   from "../utils/asyncHandler.js";
import ApiError       from "../utils/ApiError.js";
import User           from "../models/user.model.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Access token required");

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decoded.id).select("-password -refreshToken");
  if (!user) throw new ApiError(401, "User not found");

  req.user = user;
  next();
});

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    throw new ApiError(403, `Role '${req.user?.role}' not authorized`);
  }
  next();
};

export const requireSubscription = (...plans) => (req, _res, next) => {
  if (!plans.includes(req.user?.subscription)) {
    throw new ApiError(402, `This feature requires: ${plans.join(" or ")} plan`);
  }
  next();
};

export const requireVerified = (req, _res, next) => {
  if (!req.user?.isVerified) {
    throw new ApiError(403, "Please verify your email to access this feature");
  }
  next();
};