import { Router } from "express";

import {
  protect,
  requireVerified,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  banUserSchema,
  updateUserPlanSchema,
} from "../validators/admin.validator.js";

import {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  banUser,
  unbanUser,
  updateUserPlan,
  deleteUser,
  getRevenueAnalytics,
  getAiUsage,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(
  protect,
  requireVerified,
  authorizeRoles("admin")
);

router.get("/stats", getDashboardStats);
router.get("/revenue", getRevenueAnalytics);
router.get("/ai-usage", getAiUsage);

router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetail);

router.patch(
  "/users/:userId/ban",
  validate(banUserSchema),
  banUser
);

router.patch(
  "/users/:userId/unban",
  unbanUser
);

router.patch(
  "/users/:userId/plan",
  validate(updateUserPlanSchema),
  updateUserPlan
);

router.delete(
  "/users/:userId",
  deleteUser
);

export default router;