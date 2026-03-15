/**
 * Email Service
 * Handles all email sending operations
 */

import { transporter, SENDER_EMAIL } from '../config/gmail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a generic email
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!transporter) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📧 EMAIL (NOT SENT - Gmail not configured)`);
    console.log(`${'='.repeat(60)}`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`${'='.repeat(60)}\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email. Please try again later.');
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
  if (!transporter) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📧 OTP FOR TESTING`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: 10 minutes`);
    console.log(`${'='.repeat(60)}\n`);
    return;
  }

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
  if (!transporter) {
    console.log(`📧 Welcome email would be sent to: ${email}`);
    return;
  }

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
              <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
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
