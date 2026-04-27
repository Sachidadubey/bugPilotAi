import nodemailer from "nodemailer";
import logger from "./logger.js";

const createTransporter = () =>
  nodemailer.createTransport({
    host:   "smtp.gmail.com",
    port:   587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
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