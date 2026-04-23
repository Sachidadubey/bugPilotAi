import asyncHandler  from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError      from "../utils/ApiError.js"; 
import * as authSvc  from "../services/auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict",
};

const ACCESS_COOKIE_OPTIONS  = { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 };
const REFRESH_COOKIE_OPTIONS = { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 };

export const register = asyncHandler(async (req, res) => {
  await authSvc.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, null, " User  Registered successfully. Check email for OTP."));
});

export const login = asyncHandler(async (req, res) => {
  const data = await authSvc.loginUser(req.body);
  res
    .cookie("accessToken",  data.accessToken,  ACCESS_COOKIE_OPTIONS)
    .cookie("refreshToken", data.refreshToken, REFRESH_COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, { user: data.user, accessToken: data.accessToken }, "Login successful"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const data  = await authSvc.refreshLogin(token);
  res
    .cookie("accessToken",  data.accessToken,  ACCESS_COOKIE_OPTIONS)
    .cookie("refreshToken", data.refreshToken, REFRESH_COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, { accessToken: data.accessToken }, "Token refreshed"));
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "Current user"));
});

export const logout = asyncHandler(async (req, res) => {
  await authSvc.logoutUser(req.user._id);
  res
    .clearCookie("accessToken",  COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully "));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  await authSvc.verifyEmailOtp(req.body);
  res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});

export const resendOtp = asyncHandler(async (req, res) => {
  await authSvc.resendOtp(req.body);
  res.status(200).json(new ApiResponse(200, null, "OTP resent to your email"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authSvc.forgotPassword(req.body);
  // Always 200 — never reveal if email exists
  res.status(200).json(new ApiResponse(200, null, "If this email exists,  a password reset OTP has been sent"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authSvc.resetPassword(req.body);
  res.status(200).json(new ApiResponse(200, null, "Password reset successfully. Please log in."));
});

export const changePassword = asyncHandler(async (req, res) => {
  await authSvc.changePassword(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, null, "Password changed. Please log in again."));
});