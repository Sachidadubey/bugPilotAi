import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "./logger.js";

let genAI;
let textModel;
let visionModel;

export const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn("GEMINI_API_KEY not set — AI features will fail");
    return;
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // gemini-2.0-flash — fastest, cheapest, good for text analysis
 textModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",   // ← yeh use karo
  generationConfig: {
    temperature:     0.2,
    maxOutputTokens: 2048,
  },
});

visionModel = textModel;

  logger.info("Gemini AI initialized");
};

export const getTextModel   = () => textModel;
export const getVisionModel = () => visionModel;