import crypto from "crypto";

/**
 * Cryptographically secure 6-digit OTP.
 * crypto.randomInt is CSPRNG — Math.random is NOT safe for OTPs.
 */
export const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();