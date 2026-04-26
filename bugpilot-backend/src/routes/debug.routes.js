import { Router }          from "express";
import { protect }         from "../middlewares/auth.middleware.js";
import { requireVerified } from "../middlewares/auth.middleware.js";
import { checkUsageLimit } from "../middlewares/usage.middleware.js";
import { upload }          from "../middlewares/upload.middleware.js";
import {validate }           from "../middlewares/validate.middleware.js";
import { analyzeSchema }   from "../validators/debug.validator.js";
import {
  analyzeError, getHistory,
  getSession,   deleteSession, getUsageStats,
} from "../controllers/debug.controller.js";

const router = Router();

// All debug routes — must be logged in + verified
router.use(protect, requireVerified);

// Core AI route
router.post(
  "/analyze",
  upload.single("file"),       // multer — optional file upload
  validate(analyzeSchema),     // Joi validation
  checkUsageLimit,             // daily limit check
  analyzeError
);

// History & session management
router.get("/history",    getHistory);
router.get("/stats",      getUsageStats);
router.get("/:id",        getSession);
router.delete("/:id",     deleteSession);

export default router;