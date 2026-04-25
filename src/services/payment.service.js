import crypto  from "crypto";
import Payment from "../models/payment.model.js";
import User    from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import logger   from "../config/logger.js";
import { getRazorpay } from "../config/razorpay.js";
import { sendMail } from "../config/email.js";
import { proActivationTemplate } from "../utils/emailTemplates.js";

// ── Plan config ───────────────────────────────────────────────────────────────
const PLANS = {
  pro: {
    amount:      49900,   // ₹499 in paise
    currency:    "INR",
    description: "BugPilot AI — Pro Plan (1 Month)",
    durationDays: 30,
  },
};

// ── Create Razorpay order ─────────────────────────────────────────────────────
export const createOrderService = async (userId, { plan }) => {
  const planConfig = PLANS[plan];
  if (!planConfig) throw new ApiError(400, "Invalid plan");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.subscription === "pro") {
    throw new ApiError(400, "You are already on the Pro plan");
  }

  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount:   planConfig.amount,
    currency: planConfig.currency,
    notes: {
      userId: userId.toString(),
      plan,
    },
  });

  // Save order in DB — status: created
  await Payment.create({
    userId,
    orderId: order.id,
    plan,
    amount:  planConfig.amount,
    status:  "created",
  });

  return {
    orderId:     order.id,
    amount:      planConfig.amount,
    currency:    planConfig.currency,
    description: planConfig.description,
    paymentId:       process.env.RAZORPAY_KEY_ID,
    user: {
      name:  user.name,
      email: user.email,
    },
  };
};

// ── Verify payment + activate subscription ────────────────────────────────────
export const verifyPaymentService = async (userId, {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  // Step 1 — Verify signature
  // Razorpay signs: orderId + "|" + paymentId with webhook secret
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected  = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed — invalid signature");
  }

  // Step 2 — Find payment record
  const payment = await Payment.findOne({ orderId: razorpay_order_id, userId });
  if (!payment) throw new ApiError(404, "Payment record not found");
  if (payment.status === "paid") {
    throw new ApiError(400, "Payment already processed");
  }

  // Step 3 — Update payment record
  const subscribedAt = new Date();
  const expiresAt    = new Date(
    subscribedAt.getTime() + PLANS[payment.plan].durationDays * 24 * 60 * 60 * 1000
  );

  payment.paymentId   = razorpay_payment_id;
  payment.signature   = razorpay_signature;
  payment.status      = "paid";
  payment.subscribedAt= subscribedAt;
  payment.expiresAt   = expiresAt;
  await payment.save();

  // Step 4 — Upgrade user to pro
  const user = await User.findByIdAndUpdate(
    userId,
    { subscription: "pro" },
    { new: true }
  );

  // Step 5 — Send confirmation email
  await sendMail({
    to:      user.email,
    subject: "BugPilot AI — Pro plan activated!",
    html:    proActivationTemplate(user.name, expiresAt),
  }).catch((err) => logger.error(`Pro email failed: ${err.message}`));

  return {
    plan:        "pro",
    subscribedAt,
    expiresAt,
    paymentId:   razorpay_payment_id,
  };
};

// ── Webhook handler ───────────────────────────────────────────────────────────
export const handleWebhookService = async (rawBody, signature) => {
  // Verify webhook signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const event = JSON.parse(rawBody);
  logger.info(`Razorpay webhook: ${event.event}`);

  if (event.event === "payment.captured") {
    const orderId   = event.payload.payment.entity.order_id;
    const paymentId = event.payload.payment.entity.id;

    const payment = await Payment.findOne({ orderId });
    if (payment && payment.status !== "paid") {
      payment.paymentId    = paymentId;
      payment.status       = "paid";
      payment.subscribedAt = new Date();
      payment.expiresAt    = new Date(
        Date.now() + PLANS[payment.plan].durationDays * 24 * 60 * 60 * 1000
      );
      payment.webhookEvent = event.event;
      await payment.save();

      await User.findByIdAndUpdate(payment.userId, { subscription: "pro" });
      logger.info(`Pro activated via webhook for user: ${payment.userId}`);
    }
  }

  if (event.event === "payment.failed") {
    const orderId = event.payload.payment.entity.order_id;
    await Payment.findOneAndUpdate({ orderId }, { status: "failed" });
    logger.warn(`Payment failed for order: ${orderId}`);
  }

  return { received: true };
};

// ── Billing history ───────────────────────────────────────────────────────────
export const getBillingHistoryService = async (userId) => {
  const payments = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .select("-signature -webhookEvent -__v");

  return payments;
};

// ── Cancel / Downgrade to free ────────────────────────────────────────────────
export const cancelSubscriptionService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.subscription === "free") {
    throw new ApiError(400, "You are already on the free plan");
  }

  // Downgrade — no refund logic (add if needed)
  await User.findByIdAndUpdate(userId, { subscription: "free" });

  logger.info(`User ${userId} downgraded to free`);
};

