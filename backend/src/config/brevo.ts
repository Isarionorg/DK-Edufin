/**
 * Brevo SMTP Configuration
 */

import nodemailer from "nodemailer";

const BREVO_LOGIN = process.env.BREVO_LOGIN;
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY;

let transporter: nodemailer.Transporter | null = null;

if (BREVO_LOGIN && BREVO_SMTP_KEY) {
  transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: BREVO_LOGIN,
      pass: BREVO_SMTP_KEY,
    },
  });

  console.log(
    `✅ Brevo SMTP configured. Sending emails from: ${process.env.SENDER_EMAIL}`
  );
} else {
  console.warn(
    "⚠️ Brevo credentials not configured. Emails will not be sent."
  );
}

export { transporter };
export const SENDER_EMAIL =
  process.env.SENDER_EMAIL || "noreply@example.com";