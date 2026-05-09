import nodemailer from "nodemailer";
import logger from "./logger.js";

const createTransporter = () =>
  nodemailer.createTransport({
    host:   "smtp.gmail.com",
    port:   465,
    secure: true,      // 465 is the secure port for SMTP
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

export const sendMail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"BugPilot AI" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
  logger.info(`Email sent to ${to} — ${info.messageId}`);
};