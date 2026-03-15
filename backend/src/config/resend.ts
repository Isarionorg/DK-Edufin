import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('⚠️  RESEND_API_KEY is not configured. OTP emails will be logged to console only.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';
