import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: false,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: String,
      default: "",
    },

    signature: {
      type: String,
      default: "",
    },

    plan: {
  type: String,
  enum: ["pro", "external"],
  default: "pro",
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },

    subscribedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    webhookEvent: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
