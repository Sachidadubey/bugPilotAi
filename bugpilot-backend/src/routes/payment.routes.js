import { Router }          from "express";
import { protect }         from "../middlewares/auth.middleware.js";
import { requireVerified } from "../middlewares/auth.middleware.js";
import { validate }            from "../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator.js";
import {
  createOrder, verifyPayment, handleWebhook,
  getBillingHistory, cancelSubscription,
} from "../controllers/payment.controller.js";

const router = Router();

// Webhook — NO auth, NO json parser (needs raw body)
router.post("/webhook", handleWebhook);

// Protected routes
router.use(protect, requireVerified);

router.post  ("/order",    validate(createOrderSchema),   createOrder);
router.post  ("/verify",   validate(verifyPaymentSchema), verifyPayment);
router.get   ("/billing",  getBillingHistory);
router.delete("/cancel",   cancelSubscription);

export default router;