import Joi from "joi";

export const createOrderSchema = Joi.object({
  plan: Joi.string().valid("pro").required(),
});

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id:   Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature:  Joi.string().required(),
});