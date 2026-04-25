import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    // Razorpay IDs
    orderId:   { type: String, required: true, unique: true },
    paymentId: { type: String, default: "" },
    signature: { type: String, default: "" },

    // Plan details
    plan:   { type: String, enum: ["pro"], default: "pro" },
    amount: { type: Number, required: true }, // in paise (INR * 100)

    status: {
      type:    String,
      enum:    ["created", "paid", "failed", "refunded"],
      default: "created",
    },

    // Subscription period
    subscribedAt: { type: Date, default: null },
    expiresAt:    { type: Date, default: null },

    // Razorpay webhook raw event
    webhookEvent: { type: String, default: "" },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);