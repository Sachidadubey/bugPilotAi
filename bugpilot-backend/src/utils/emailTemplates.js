export const otpEmailTemplate = (otp) => `
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
  <h2 style="color:#1e1b4b;margin:0 0 8px">BugPilot AI</h2>
  <p style="color:#374151;margin:0 0 24px">Your email verification OTP:</p>
  <div style="font-size:40px;font-weight:700;letter-spacing:12px;color:#4f46e5;margin:0 0 24px">${otp}</div>
  <p style="color:#6b7280;font-size:13px;margin:0">Expires in <strong>10 minutes</strong>. Do not share this.</p>
</div>`;

export const passwordResetTemplate = (link) => `
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
  <h2 style="color:#1e1b4b;margin:0 0 8px">BugPilot AI</h2>
  <p style="color:#374151;margin:0 0 24px">Click below to reset your password. Link expires in <strong>15 minutes</strong>.</p>
  <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a>
  <p style="color:#6b7280;font-size:12px;margin:24px 0 0">If you didn't request this, ignore this email.</p>
</div>`;
 // ── Email template ────────────────────────────────────────────────────────────
 export const proActivationTemplate = (name, expiresAt) => `
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
  <h2 style="color:#4f46e5;margin:0 0 8px">🎉 Pro Plan Activated!</h2>
  <p style="color:#374151;">Hey ${name}, your BugPilot AI Pro plan is now active.</p>
  <ul style="color:#374151;">
    <li>Unlimited debug sessions</li>
    <li>Priority AI processing</li>
    <li>Full debug history</li>
  </ul>
  <p style="color:#6b7280;font-size:13px;">Valid until: <strong>${new Date(expiresAt).toDateString()}</strong></p>
</div>`;