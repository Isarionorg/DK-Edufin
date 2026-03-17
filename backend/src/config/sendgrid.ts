/**
 * SendGrid Configuration
 * Uses SendGrid API to send emails
 */

import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || "your_verified_email@gmail.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log(`✅ SendGrid configured. Sending emails from: ${SENDER_EMAIL}`);
} else {
  console.warn("⚠️ SendGrid API key not configured. Emails will be logged only.");
}

export { sgMail, SENDER_EMAIL };