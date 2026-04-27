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
    // Remove markdown fences
    let clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/g, "")
      .trim();

    // Find JSON object in response
    const start = clean.indexOf("{");
    const end   = clean.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      clean = clean.slice(start, end + 1);
    }

    return JSON.parse(clean);
  } catch (err) {
    logger.error(`JSON parse failed: ${err.message} | Raw: ${text?.substring(0, 300)}`);
    // Return safe default instead of crashing
    return {
      rootCause:   "Analysis completed — see explanation below",
      explanation: text || "No explanation available",
      solution:    "Review the explanation above for guidance",
      codeSnippet: "",
      severity:    "medium",
      tags:        [],
      references:  [],
    };
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

  // Fix mode bhi same analyze prompt use kare — consistent JSON output
  const prompt = buildAnalyzePrompt(code, language);

  try {
    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    const parsed = parseJSON(text);
    const tokens = estimateTokens(prompt + text);

    return { analysis: parsed, tokensUsed: tokens };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, "AI fix service error. Please try again.");
  }
};

// ── Optimize code ─────────────────────────────────────────────────────────────
export const optimizeCode = async ({ code, language = "unknown" }) => {
  const model = getTextModel();
  if (!model) throw new ApiError(503, "AI service not initialized");

  const prompt = buildAnalyzePrompt(code, language);

  try {
    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    const parsed = parseJSON(text);
    const tokens = estimateTokens(prompt + text);

    return { analysis: parsed, tokensUsed: tokens };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, "AI optimize service error. Please try again.");
  }
};