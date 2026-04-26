import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema, loginSchema, verifyOtpSchema,
  resendOtpSchema, forgotPasswordSchema,
  resetPasswordSchema, changePasswordSchema,
} from "../validators/auth.validator.js";
import {
  register, login, logout, me, refreshToken,
  verifyOtp, resendOtp, forgotPassword,
  resetPassword, changePassword,
} from "../controllers/auth.controller.js";

const router = Router();

// Public
router.post("/register",        validate(registerSchema),       register);
router.post("/login",           validate(loginSchema),          login);
router.post("/refresh-token",                                   refreshToken);
router.post("/verify-otp",      validate(verifyOtpSchema),      verifyOtp);
router.post("/resend-otp",      validate(resendOtpSchema),      resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password",  validate(resetPasswordSchema),  resetPassword);

// Protected
router.get ("/me",              protect,                        me);
router.post("/logout",          protect,                        logout);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;