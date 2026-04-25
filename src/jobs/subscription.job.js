import User    from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import logger  from "../config/logger.js";

/**
 * Run daily — downgrade expired pro users to free
 * Call this from server.js with setInterval or a cron
 */
export const checkExpiredSubscriptions = async () => {
  try {
    const expiredPayments = await Payment.find({
      status:    "paid",
      expiresAt: { $lt: new Date() },
    });

    const userIds = expiredPayments.map((p) => p.userId);

    if (userIds.length === 0) return;

    await User.updateMany(
      { _id: { $in: userIds }, subscription: "pro" },
      { subscription: "free" }
    );

    logger.info(`Downgraded ${userIds.length} expired pro users to free`);
  } catch (err) {
    logger.error(`Subscription job failed: ${err.message}`);
  }
};