/**
 * Gmail SMTP Configuration
 * Uses Gmail's SMTP server to send emails
 */

import nodemailer from 'nodemailer';

const gmailEmail = process.env.GMAIL_EMAIL;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

// Create transporter
let transporter: nodemailer.Transporter | null = null;

if (gmailEmail && gmailAppPassword) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailEmail,
      pass: gmailAppPassword
    }
  });

  console.log(`✅ Gmail SMTP configured. Sending emails from: ${gmailEmail}`);
} else {
  console.warn('⚠️  Gmail credentials not configured. Emails will be logged to console only.');
  console.warn('    Set GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env to enable real email sending.');
}

export { transporter };
export const SENDER_EMAIL = gmailEmail || 'no-reply@dkedufin.com';
