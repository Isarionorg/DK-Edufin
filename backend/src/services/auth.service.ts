// src/services/auth.service.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// TYPES & INTERFACES
// ============================================

interface RegisterUserDTO {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

interface VerifyOTPDTO {
  email: string;
  otp_code: string;
}

interface JWTPayload {
  user_id: string;
  email: string;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates email format
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements: Min 8 chars, at least 1 uppercase, 1 number
 */
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

/**
 * Validates phone number format (basic)
 */
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates a random 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hashes a password using bcrypt
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares plain password with hashed password
 */
const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generates JWT token with 7-day expiry
 */
const generateJWT = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

/**
 * Sends OTP email using Resend
 */
const sendOTPEmail = async (email: string, otp: string, userName: string): Promise<void> => {
  try {
    await resend.emails.send({
      from: 'DK Edufin <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Email - DK Edufin',
      html: `
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
              .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
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
                <p>To complete your registration, please verify your email address using the OTP below:</p>
                
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
      `
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};

// ============================================
// MAIN AUTH SERVICES
// ============================================

/**
 * Register a new user
 * 
 * Flow:
 * 1. Validate input data
 * 2. Check if user already exists
 * 3. Hash password
 * 4. Create user in database
 * 5. Generate and store OTP
 * 6. Send OTP email
 * 7. Return success response
 */
export const registerUser = async (userData: RegisterUserDTO) => {
  // 1. VALIDATE INPUT
  if (!userData.email || !userData.password || !userData.full_name) {
    throw new Error('Email, password, and full name are required');
  }
  
  if (!validateEmail(userData.email)) {
    throw new Error('Please enter a valid email address');
  }
  
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message || 'Invalid password');
  }
  
  if (userData.phone && !validatePhone(userData.phone)) {
    throw new Error('Please enter a valid 10-digit phone number');
  }
  
  // 2. CHECK IF USER EXISTS
  const existingUser = await prisma.users.findUnique({
    where: { email: userData.email.toLowerCase().trim() }
  });
  
  if (existingUser) {
    throw new Error('An account with this email already exists. Please login instead.');
  }
  
  // 3. HASH PASSWORD
  const hashedPassword = await hashPassword(userData.password);
  
  // 4. CREATE USER
  const user = await prisma.users.create({
    data: {
      email: userData.email.toLowerCase().trim(),
      password_hash: hashedPassword,
      full_name: userData.full_name.trim(),
      phone: userData.phone?.trim() || null,
      is_email_verified: false
    }
  });
  
  // 5. GENERATE OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  // Store OTP in database
  await prisma.otp_verification.create({
    data: {
      user_id: user.user_id,
      otp_code: otp,
      expires_at: expiresAt,
      is_used: false
    }
  });
  
  // 6. SEND OTP EMAIL
  try {
    await sendOTPEmail(user.email, otp, user.full_name);
  } catch (emailError) {
    // Rollback user creation if email fails
    await prisma.users.delete({ where: { user_id: user.user_id } });
    throw emailError;
  }
  
  // 7. RETURN SUCCESS
  return {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    message: 'Registration successful! Please check your email for the OTP.'
  };
};

/**
 * Verify OTP and activate user account
 * 
 * Flow:
 * 1. Validate input
 * 2. Find user by email
 * 3. Check if already verified
 * 4. Find valid OTP
 * 5. Verify OTP conditions (not expired, not used, matches)
 * 6. Mark user as verified
 * 7. Mark OTP as used
 * 8. Generate JWT token
 * 9. Return token and user data
 */
export const verifyOTP = async (verificationData: VerifyOTPDTO) => {
  // 1. VALIDATE INPUT
  if (!verificationData.email || !verificationData.otp_code) {
    throw new Error('Email and OTP code are required');
  }
  
  if (verificationData.otp_code.length !== 6) {
    throw new Error('OTP must be 6 digits');
  }
  
  // 2. FIND USER
  const user = await prisma.users.findUnique({
    where: { email: verificationData.email.toLowerCase().trim() }
  });
  
  if (!user) {
    throw new Error('No account found with this email. Please register first.');
  }
  
  // 3. CHECK IF ALREADY VERIFIED
  if (user.is_email_verified) {
    throw new Error('Email is already verified. Please login.');
  }
  
  // 4. FIND OTP
  const otpRecord = await prisma.otp_verification.findFirst({
    where: {
      user_id: user.user_id,
      otp_code: verificationData.otp_code,
      is_used: false
    },
    orderBy: {
      created_at: 'desc'
    }
  });
  
  if (!otpRecord) {
    throw new Error('Invalid OTP. Please check and try again.');
  }
  
  // 5. CHECK EXPIRY
  if (otpRecord.expires_at < new Date()) {
    throw new Error('OTP has expired. Please request a new one.');
  }
  
  // 6. MARK USER AS VERIFIED
  const verifiedUser = await prisma.users.update({
    where: { user_id: user.user_id },
    data: { is_email_verified: true }
  });
  
  // 7. MARK OTP AS USED
  await prisma.otp_verification.update({
    where: { otp_id: otpRecord.otp_id },
    data: { is_used: true }
  });
  
  // 8. GENERATE JWT TOKEN
  const token = generateJWT({
    user_id: verifiedUser.user_id,
    email: verifiedUser.email
  });
  
  // 9. RETURN SUCCESS
  return {
    token,
    user: {
      user_id: verifiedUser.user_id,
      email: verifiedUser.email,
      full_name: verifiedUser.full_name,
      phone: verifiedUser.phone,
      is_email_verified: verifiedUser.is_email_verified
    },
    message: 'Email verified successfully! Welcome to DK Edufin.'
  };
};

/**
 * Resend OTP to user
 * 
 * Flow:
 * 1. Validate email
 * 2. Find user
 * 3. Check if already verified
 * 4. Generate new OTP
 * 5. Store in database
 * 6. Send email
 * 7. Return success
 */
export const resendOTP = async (email: string) => {
  // 1. VALIDATE EMAIL
  if (!email) {
    throw new Error('Email is required');
  }
  
  if (!validateEmail(email)) {
    throw new Error('Please enter a valid email address');
  }
  
  // 2. FIND USER
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase().trim() }
  });
  
  if (!user) {
    throw new Error('No account found with this email. Please register first.');
  }
  
  // 3. CHECK IF ALREADY VERIFIED
  if (user.is_email_verified) {
    throw new Error('Email is already verified. Please login.');
  }
  
  // Optional: Check recent OTP requests for monitoring (not blocking)
  const recentOTPs = await prisma.otp_verification.findMany({
    where: {
      user_id: user.user_id,
      created_at: {
        gte: new Date(Date.now() - 60 * 60 * 1000) // Last 1 hour
      }
    }
  });
  
  // Log for monitoring but don't block (early stage - user priority)
  if (recentOTPs.length > 5) {
    console.warn(`User ${user.email} has requested ${recentOTPs.length} OTPs in the last hour`);
  }
  
  // 4. GENERATE NEW OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // 5. STORE OTP
  await prisma.otp_verification.create({
    data: {
      user_id: user.user_id,
      otp_code: otp,
      expires_at: expiresAt,
      is_used: false
    }
  });
  
  // 6. SEND EMAIL
  await sendOTPEmail(user.email, otp, user.full_name);
  
  // 7. RETURN SUCCESS
  return {
    message: 'OTP has been resent to your email. Please check your inbox.'
  };
};

/**
 * Login user with email and password
 * 
 * Flow:
 * 1. Validate input
 * 2. Find user by email
 * 3. Check if email is verified
 * 4. Verify password
 * 5. Generate JWT token
 * 6. Return token and user data
 */
export const loginUser = async (loginData: LoginDTO) => {
  // 1. VALIDATE INPUT
  if (!loginData.email || !loginData.password) {
    throw new Error('Email and password are required');
  }
  
  if (!validateEmail(loginData.email)) {
    throw new Error('Please enter a valid email address');
  }
  
  // 2. FIND USER
  const user = await prisma.users.findUnique({
    where: { email: loginData.email.toLowerCase().trim() }
  });
  
  if (!user) {
    throw new Error('Invalid email or password. Please check your credentials.');
  }
  
  // 3. CHECK EMAIL VERIFICATION
  if (!user.is_email_verified) {
    throw new Error('Please verify your email before logging in. Check your inbox for the OTP.');
  }
  
  // 4. VERIFY PASSWORD
  const isPasswordValid = await comparePassword(loginData.password, user.password_hash);
  
  if (!isPasswordValid) {
    throw new Error('Invalid email or password. Please check your credentials.');
  }
  
  // 5. GENERATE JWT TOKEN
  const token = generateJWT({
    user_id: user.user_id,
    email: user.email
  });
  
  // 6. RETURN SUCCESS
  return {
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      is_email_verified: user.is_email_verified
    },
    message: 'Login successful! Welcome back.'
  };
};

/**
 * Verify JWT token (for middleware)
 * 
 * @param token - JWT token from Authorization header
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Your session has expired. Please login again.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token. Please login again.');
    } else {
      throw new Error('Authentication failed. Please login again.');
    }
  }
};

/**
 * Get user by ID (for protected routes)
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      full_name: true,
      phone: true,
      is_email_verified: true,
      created_at: true
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};