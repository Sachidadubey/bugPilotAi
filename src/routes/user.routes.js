import { Router }       from "express";
import { protect }      from "../middlewares/auth.middleware.js";
import { requireVerified } from "../middlewares/auth.middleware.js";
import { validate }         from "../middlewares/validate.middleware.js";
import {
  updateProfileSchema,
} from "../validators/user.validator.js";
import {
  getProfile, updateProfile, getUsageStats,
  getDebugHistory, getPlanInfo, deleteAccount,
} from "../controllers/user.controller.js";

const router = Router();

// All routes — must be logged in + verified
router.use(protect, requireVerified);

router.get  ("/profile",      getProfile);
router.patch("/profile",      validate(updateProfileSchema), updateProfile);
router.get  ("/stats",        getUsageStats);
router.get  ("/history",      getDebugHistory);
router.get  ("/plan",         getPlanInfo);
router.delete("/account",     deleteAccount);

export default router;