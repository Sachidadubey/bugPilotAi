import fs           from "fs";
import Debug        from "../models/debug.model.js";
import ApiError     from "../utils/ApiError.js";
import logger       from "../config/logger.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { analyzeText, analyzeImage, fixCode, optimizeCode } from "./ai.service.js";
import { incrementUsage } from "../middlewares/usage.middleware.js";

// ── Analyze ───────────────────────────────────────────────────────────────────
export const analyzeErrorService = async ({
  userId, inputType, textInput,
  language, mode, file, usageKey, subscription,
}) => {
  // Create session immediately — track even failures
  const session = await Debug.create({
    userId,
    inputType,
    textInput: textInput || "",
    language:  language  || "unknown",
    status:    "pending",
  });

  try {
    await Debug.findByIdAndUpdate(session._id, { status: "processing" });

    let result;

    if (inputType === "image") {
      if (!file) throw new ApiError(400, "Image file required for image input type");

      // Upload to Cloudinary first
      const uploaded = await uploadToCloudinary(file.path);

      await Debug.findByIdAndUpdate(session._id, {
        imageUrl:      uploaded.secure_url,
        imagePublicId: uploaded.public_id,
      });

      // Pass local file path — faster for Gemini vision
      result = await analyzeImage({
        imageUrl:      uploaded.secure_url,
        localFilePath: file.path,
      });

    } else {
      // text | code | log
      if (mode === "fix") {
        result = await fixCode({ code: textInput, language });
      } else if (mode === "optimize") {
        result = await optimizeCode({ code: textInput, language });
      } else {
        result = await analyzeText({ input: textInput, language });
      }
    }

    // Save result
    const updated = await Debug.findByIdAndUpdate(
      session._id,
      {
        analysis:   result.analysis,
        tokensUsed: result.tokensUsed,
        status:     "completed",
      },
      { new: true }
    );

    // Increment daily usage counter (skip for pro)
    if (subscription === "free" && usageKey) {
      await incrementUsage(usageKey);
    }

    // Cleanup temp file
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return updated;

  } catch (err) {
    await Debug.findByIdAndUpdate(session._id, {
      status:       "failed",
      errorMessage: err.message,
    });

    // Cleanup temp file on error too
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw err;
  }
};

// ── History ───────────────────────────────────────────────────────────────────
export const getHistoryService = async ({ userId, page = 1, limit = 10, status, inputType }) => {
  const skip   = (Number(page) - 1) * Number(limit);
  const filter = { userId };

  if (status)    filter.status    = status;
  if (inputType) filter.inputType = inputType;

  const [sessions, total] = await Promise.all([
    Debug.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v"),
    Debug.countDocuments(filter),
  ]);

  return {
    sessions,
    pagination: {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasNext:    Number(page) < Math.ceil(total / Number(limit)),
    },
  };
};

// ── Single session ────────────────────────────────────────────────────────────
export const getSessionService = async ({ sessionId, userId }) => {
  const session = await Debug.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Debug session not found");
  return session;
};

// ── Delete session ────────────────────────────────────────────────────────────
export const deleteSessionService = async ({ sessionId, userId }) => {
  const session = await Debug.findOne({ _id: sessionId, userId });
  if (!session) throw new ApiError(404, "Debug session not found");

  // Delete Cloudinary image if exists
  if (session.imagePublicId) {
    await deleteFromCloudinary(session.imagePublicId);
  }

  await session.deleteOne();
};

// ── Usage stats ───────────────────────────────────────────────────────────────
export const getUsageStatsService = async ({ userId }) => {
  const today = new Date().toISOString().split("T")[0];
  const startOfDay = new Date(`${today}T00:00:00.000Z`);

  const [total, todayCount, completed, failed] = await Promise.all([
    Debug.countDocuments({ userId }),
    Debug.countDocuments({ userId, createdAt: { $gte: startOfDay } }),
    Debug.countDocuments({ userId, status: "completed" }),
    Debug.countDocuments({ userId, status: "failed" }),
  ]);

  const tokenAgg = await Debug.aggregate([
    { $match: { userId: userId } },
    { $group: { _id: null, totalTokens: { $sum: "$tokensUsed" } } },
  ]);

  return {
    total,
    todayCount,
    completed,
    failed,
    totalTokensUsed: tokenAgg[0]?.totalTokens || 0,
  };
};