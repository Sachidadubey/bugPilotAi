import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "./logger.js";

let genAI;
let textModel;
let visionModel;

export const initGemini = async() => {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn("GEMINI_API_KEY not set — AI features will fail");
    return;
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 // Check available models
  // const res  = await fetch(
  //   `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  // );
  // const data = await res.json();
  // const names = data.models?.map(m => m.name) || [];
  // console.log("AVAILABLE MODELS:", names.join(", "));

  
textModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite", // Use latest available model
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