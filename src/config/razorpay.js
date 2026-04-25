import Razorpay from "razorpay";
import logger   from "./logger.js";

let razorpay;

export const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    logger.warn("Razorpay keys not set — payment features will fail");
    return;
  }

  razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  logger.info("Razorpay initialized");
};

export const getRazorpay = () => {
  if (!razorpay) throw new Error("Razorpay not initialized");
  return razorpay;
};