/**
 * Email Service
 * Handles all email sending operations
 */

import { sendBrevoEmail } from "../config/brevo";
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a generic email
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Check if Brevo API key is configured
  if (!process.env.BREVO_API_KEY) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📧 EMAIL (NOT SENT - Brevo API not configured)`);
    console.log(`${'='.repeat(60)}`);
    console.log(`BREVO_API_KEY exists: ${!!process.env.BREVO_API_KEY}`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`${'='.repeat(60)}\n`);
    return;
  }

  try {
    console.log(`📤 Sending email via Brevo API:`);
    console.log(`   To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);

    await sendBrevoEmail({
      to: options.to,
      subject: options.subject,
      htmlContent: options.html,
    });

    console.log(`✅ Email sent successfully`);
  } catch (error: any) {
    console.error("❌ Brevo API Error Details:", {
      message: error?.message,
      error: error,
      stack: error?.stack
    });
    throw new Error("Failed to send email. Please try again later.");
  }
};

/**
 * Send OTP verification email
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName: string
): Promise<void> => {
  // Log OTP to console if Gmail not configured
  // if (!transporter) {
  //   console.log(`\n${'='.repeat(60)}`);
  //   console.log(`📧 OTP FOR TESTING`);
  //   console.log(`${'='.repeat(60)}`);
  //   console.log(`Email: ${email}`);
  //   console.log(`OTP Code: ${otp}`);
  //   console.log(`Valid for: 10 minutes`);
  //   console.log(`${'='.repeat(60)}\n`);
  //   return;
  // }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to DK Edufin! 🎓</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for registering with DK Edufin. We're excited to help you find your perfect college!</p>
            <p>To complete your registration and verify your email, please use the OTP below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your One-Time Password</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            
            <p><strong>Security Note:</strong> Never share this OTP with anyone. DK Edufin will never ask for your OTP via phone or email.</p>
            
            <p style="margin-top: 30px;">If you didn't create an account with DK Edufin, please ignore this email.</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} DK Edufin. All rights reserved.</p>
              <p>Need help? Contact us at support@dkedufin.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - DK Edufin',
    html: htmlContent
  });
};

/**
 * Send welcome email after successful onboarding
 */
export const sendWelcomeEmail = async (
  email: string,
  userName: string
): Promise<void> => {
  // if (!transporter) {
  //   console.log(`📧 Welcome email would be sent to: ${email}`);
  //   return;
  // }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to DK Edufin! 🎓</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your email has been verified successfully! Your account is now fully active.</p>
            <p>You can now:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Browse colleges and courses</li>
              <li>Track your preferences</li>
              <li>Get personalized recommendations</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="http://dk-edufin.vercel.app/dashboard" class="button">Go to Dashboard</a>
            </p>
            
            <p style="margin-top: 30px;">Need assistance? Contact our support team at support@dkedufin.com</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} DK Edufin. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to DK Edufin!',
    html: htmlContent
  });
};

/**
 * Send password reset OTP email
 */
export const sendPasswordResetEmail = async (
  email: string,
  otp: string,
  userName: string
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #1d4ed8; letter-spacing: 5px; }
          .warning-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #9a3412; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">DK Edufin Account Security</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset the password for your DK Edufin account. Use the OTP below to proceed:</p>

            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your Password Reset OTP</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes only</p>
            </div>

            <div class="warning-box">
              ⚠️ <strong>Did not request this?</strong> If you did not ask to reset your password, 
              please ignore this email. Your account remains secure and no changes have been made.
            </div>

            <p><strong>Security Note:</strong> Never share this OTP with anyone. DK Edufin will never ask for your OTP via phone or chat.</p>

            <div class="footer">
              <p>© ${new Date().getFullYear()} DK Edufin. All rights reserved.</p>
              <p>Need help? Contact us at support@dkedufin.com</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset OTP - DK Edufin',
    html: htmlContent,
  });
};
