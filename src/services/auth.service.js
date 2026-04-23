// src/services/auth.service.js
import crypto          from "crypto";
import jwt             from "jsonwebtoken";
import User            from "../models/user.model.js";
import { getRedis }    from "../config/redis.js";
import ApiError        from "../utils/ApiError.js";
import { generateOtp } from "../utils/otp.js";
import { sendMail }    from "../config/email.js";
import { otpEmailTemplate, passwordResetTemplate } from "../utils/emailTemplates.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

const Keys = {
  otp:           (email) => `otp:${email}`,
  otpAttempts:   (email) => `otp_attempts:${email}`,
  passwordReset: (email) => `pwd_reset:${email}`,
};

export const registerUser = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already registered");
  const user = await User.create({ name, email, password });
  await _sendOtp(user.email);
  return null;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select("+password +refreshToken +loginAttempts +lockUntil");

  if (!user) throw new ApiError(401, "Invalid credentials");

  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError(423, `Account locked. Try again in ${minutesLeft} minutes.`);
  }

  const match = await user.comparePassword(password);
  if (!match) {
    await user.incrementLoginAttempts();
    const remaining = Math.max(0, 5 - user.loginAttempts);
    throw new ApiError(
      401,
      remaining > 0
        ? `Invalid credentials. ${remaining} attempts left.`
        : "Account locked for 15 minutes."
    );
  }

  await user.resetLoginAttempts();

  if (!user.isVerified) {
    throw new ApiError(403, "Email not verified. Check your inbox.");
  }

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken  = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: {
      id:           user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      subscription: user.subscription,
      isVerified:   user.isVerified,
    },
  };
};

export const refreshLogin = async (token) => {
  if (!token) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Refresh token reuse detected");
  }

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken  = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const _sendOtp = async (email) => {
  const redis     = getRedis();
  const otp       = generateOtp();
  const OTP_TTL   = 10 * 60;
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  await redis.set(Keys.otp(email), hashedOtp, { ex: OTP_TTL });
  await sendMail({
    to:      email,
    subject: "BugPilot AI — verify your email",
    html:    otpEmailTemplate(otp),
  });
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const redis = getRedis();

  const user = await User.findOne({ email });
  if (!user)           throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Email already verified");

  const attemptsKey      = Keys.otpAttempts(email);
  const MAX_OTP_ATTEMPTS = 5;

  const attempts = parseInt((await redis.get(attemptsKey)) || "0");
  if (attempts >= MAX_OTP_ATTEMPTS) {
    throw new ApiError(429, "Too many OTP attempts. Request a new OTP.");
  }

  const storedHash = await redis.get(Keys.otp(email));
  if (!storedHash) throw new ApiError(400, "OTP expired. Request a new one.");

  const incomingHash = crypto.createHash("sha256").update(otp).digest("hex");
  if (incomingHash !== storedHash) {
    await redis.set(attemptsKey, String(attempts + 1), { ex: 10 * 60 });
    throw new ApiError(400, "Invalid OTP");
  }

  await redis.del(Keys.otp(email));
  await redis.del(attemptsKey);
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });
};

export const resendOtp = async ({ email }) => {
  const redis = getRedis();

  const user = await User.findOne({ email });
  if (!user)           throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Email already verified");

  const existing = await redis.get(Keys.otp(email));
  if (existing) {
    const ttl = await redis.ttl(Keys.otp(email));
    if (ttl > 9 * 60) {
      throw new ApiError(429, "OTP already sent. Wait 60 seconds before resending.");
    }
  }

  await redis.del(Keys.otpAttempts(email));
  await _sendOtp(email);
};
export const forgotPassword = async ({ email }) => {
  const redis = getRedis();

  const user = await User.findOne({ email });
  if (!user) return; // silent — user enumeration prevent

  const otp      = generateOtp();
  const OTP_TTL  = 10 * 60; // 10 minutes
  const hashed   = crypto.createHash("sha256").update(otp).digest("hex");

  await redis.set(Keys.passwordReset(email), hashed, { ex: OTP_TTL });

  await sendMail({
    to:      email,
    subject: "BugPilot AI — password reset OTP",
    html:    otpEmailTemplate(otp),
  });
};



export const resetPassword = async ({ email, otp, password }) => {
  const redis = getRedis();

  const storedHash = await redis.get(Keys.passwordReset(email));
  if (!storedHash) throw new ApiError(400, "OTP expired. Request a new one.");

  const incomingHash = crypto.createHash("sha256").update(otp).digest("hex");
  if (incomingHash !== storedHash) throw new ApiError(400, "Invalid OTP");

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  user.password     = password;
  user.refreshToken = null;
  await user.save();

  await redis.del(Keys.passwordReset(email));
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const match = await user.comparePassword(currentPassword);
  if (!match) throw new ApiError(400, "Current password incorrect");

  user.password     = newPassword;
  user.refreshToken = null;
  await user.save();
};