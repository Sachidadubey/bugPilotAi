import asyncHandler    from "../utils/asyncHandler.js";
import ApiResponse     from "../utils/ApiResponse.js";
import * as paymentSvc from "../services/payment.service.js";

export const createOrder = asyncHandler(async (req, res) => {
  const data = await paymentSvc.createOrderService(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, data, "Order created"));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const data = await paymentSvc.verifyPaymentService(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, data, "Payment verified. Pro plan activated!"));
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  // req.rawBody — Express raw body (set in app.js)
  await paymentSvc.handleWebhookService(req.rawBody, signature);
  res.status(200).json({ received: true });
});

export const getBillingHistory = asyncHandler(async (req, res) => {
  const data = await paymentSvc.getBillingHistoryService(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Billing history fetched"));
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  await paymentSvc.cancelSubscriptionService(req.user._id);
  res.status(200).json(new ApiResponse(200, null, "Subscription cancelled. You are now on free plan."));
});