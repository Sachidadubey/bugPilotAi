import fs   from "fs";
import path from "path";
import { getTextModel, getVisionModel } from "../config/gemini.js";
import ApiError from "../utils/ApiError.js";
import logger   from "../config/logger.js";
import {
  buildAnalyzePrompt,
  buildImageAnalyzePrompt,
  buildFixPrompt,
  buildOptimizePrompt,
} from "../utils/prompts.js";

// ── Parse Gemini response — strip markdown fences if present ─────────────────
const parseJSON = (text) => {
  try {
    // Gemini sometimes wraps in ```json ... ``` despite instructions
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/,"").trim();
    return JSON.parse(clean);
  } catch {
    logger.error(`Gemini JSON parse failed. Raw: ${text.substring(0, 200)}`);
    throw new ApiError(500, "AI returned invalid response. Please try again.");
  }
};

// ── Count approximate tokens (Gemini doesn't expose exact count on free tier) ─
const estimateTokens = (text) => Math.ceil(text.length / 4);

// ── Analyze text / code ───────────────────────────────────────────────────────
export const analyzeText = async ({ input, language = "unknown" }) => {
  const model  = getTextModel();
  if (!model) throw new ApiError(503, "AI service not initialized");

  const prompt = buildAnalyzePrompt(input, language);

  try {
    const result   = await model.generateContent(prompt);
    const text     = result.response.text();
    const analysis = parseJSON(text);
    const tokens   = estimateTokens(prompt + text);

    return { analysis, tokensUsed: tokens };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`Gemini text analysis failed: ${err.message}`);
    throw new ApiError(502, "AI service error. Please try again.");
  }
};

// ── Analyze image (Vision) ────────────────────────────────────────────────────
export const analyzeImage = async ({ imageUrl, localFilePath }) => {
  const model = getVisionModel();
  if (!model) throw new ApiError(503, "AI service not initialized");

  try {
    let imagePart;

    if (localFilePath && fs.existsSync(localFilePath)) {
      // Use local file for vision — faster than URL fetch
      const imageData   = fs.readFileSync(localFilePath);
      const base64Image = imageData.toString("base64");
      const ext         = path.extname(localFilePath).toLowerCase();
      const mimeType    = ext === ".png" ? "image/png"
                        : ext === ".webp" ? "image/webp"
                        : "image/jpeg";

      imagePart = { inlineData: { data: base64Image, mimeType } };
    } else {
      // Fallback: use URL
      imagePart = { fileData: { mimeUri: imageUrl, mimeType: "image/jpeg" } };
    }

    const prompt = buildImageAnalyzePrompt();
    const result = await model.generateContent([prompt, imagePart]);
    const text   = result.response.text();
    const analysis = parseJSON(text);
    const tokens   = estimateTokens(prompt + text);

    return { analysis, tokensUsed: tokens };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error(`Gemini vision analysis failed: ${err.message}`);
    throw new ApiError(502, "AI vision service error. Please try again.");
  }
};

// ── Fix code ──────────────────────────────────────────────────────────────────
export const fixCode = async ({ code, language = "unknown" }) => {
  const model = getTextModel();
  if (!model) throw new ApiError(503, "AI service not initialized");

  try {
    const prompt   = buildFixPrompt(code, language);
    const result   = await model.generateContent(prompt);
    const text     = result.response.text();
    const analysis = {
      rootCause:   "Logical/syntax bug detected in provided code",
      explanation: parsed.explanation || "",
      solution:    Array.isArray(parsed.changes)
                     ? parsed.changes.join("\n")
                     : parsed.explanation || "",
      codeSnippet: parsed.fixedCode    || "",
      severity:    "medium",
      tags:        ["bug-fix"],
      references:  [],
    };
    const tokens   = estimateTokens(prompt + text);

    return { analysis, tokensUsed: tokens };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, "AI fix service error. Please try again.");
  }
};

// ── Optimize code ─────────────────────────────────────────────────────────────
export const optimizeCode = async ({ code, language = "unknown" }) => {
  const model = getTextModel();
  if (!model) throw new ApiError(503, "AI service not initialized");

  try {
    const prompt   = buildOptimizePrompt(code, language);
    const result   = await model.generateContent(prompt);
    const text     = result.response.text();
    const analysis = parseJSON(text);
    const tokens   = estimateTokens(prompt + text);

    return { analysis, tokensUsed: tokens };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, "AI optimize service error. Please try again.");
  }
};