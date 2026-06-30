// src/services/auth.service.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from './email.service';
import { createOTP, validateOTP, markOTPAsUsed, checkOTPRateLimit } from './otp.service';

const prisma = new PrismaClient();

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
      is_email_verified: false // Always require email verification
    }
  });

  // 5. GENERATE OTP AND SEND EMAIL
  // If this fails, roll back the user so they can retry registration cleanly
  try {
    const otp = await createOTP(user.user_id);
    await sendOTPEmail(user.email, otp, user.full_name || 'User');
  } catch (error) {
    await prisma.users.delete({ where: { user_id: user.user_id } });
    throw new Error(
      'Account created but we could not send the verification email. ' +
      'Please try registering again or contact support.'
    );
  }

  // 6. RETURN SUCCESS
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
 * 4. Validate OTP
 * 5. Mark user as verified
 * 6. Create user profile
 * 7. Send welcome email
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

  // 4. VALIDATE OTP
  // validateOTP already throws descriptive errors — let them bubble up naturally
  await validateOTP(user.user_id, verificationData.otp_code);

  // 5. MARK USER AS VERIFIED
  const verifiedUser = await prisma.users.update({
    where: { user_id: user.user_id },
    data: { is_email_verified: true }
  });

  // Mark OTP as used
  await markOTPAsUsed(user.user_id, verificationData.otp_code);

  // 6. CREATE USER PROFILE (if not exists)
  const existingProfile = await prisma.user_profiles.findUnique({
    where: { user_id: user.user_id }
  });

  if (!existingProfile) {
    await prisma.user_profiles.create({
      data: {
        user_id: user.user_id,
        is_profile_complete: false
      }
    });
  }

  // 7. SEND WELCOME EMAIL
  try {
    await sendWelcomeEmail(user.email, user.full_name || 'User');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Non-fatal: verification already completed, so don't throw
  }

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
 * 4. Check rate limit
 * 5. Generate new OTP
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

  // 4. CHECK RATE LIMIT (max 5 OTPs per hour)
  const isRateLimited = await checkOTPRateLimit(user.user_id, 60, 5);
  if (isRateLimited) {
    throw new Error('Too many OTP requests. Please try again after 1 hour.');
  }

  // 5. GENERATE NEW OTP AND SEND EMAIL
  // Errors from createOTP / sendOTPEmail bubble up naturally
  const otp = await createOTP(user.user_id);
  await sendOTPEmail(user.email, otp, user.full_name || 'User');

  // 6. RETURN SUCCESS
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
 * 3. Check if email is verified (skip in dev mode)
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

  // 3. CHECK EMAIL VERIFICATION (skip in development)
  if (!user.is_email_verified && process.env.NODE_ENV === 'production') {
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
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  // Guard against missing or blank ID before hitting Prisma
  // (Prisma throws a raw internal error on malformed UUIDs)
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('A valid user ID is required.');
  }

  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      full_name: true,
      phone: true,
      is_email_verified: true,
      phone_verified: true,
      created_at: true,
      updated_at: true,
      user_profiles: {
        select: {
          profile_id: true,
          date_of_birth: true,
          gender: true,
          preferred_stream: true,
          is_profile_complete: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
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

// ============================================
// FORGOT PASSWORD
// ============================================

/**
 * Initiate forgot password — send OTP to email
 */
export const forgotPassword = async (email: string) => {
  if (!email) throw new Error('Email is required');
  if (!validateEmail(email)) throw new Error('Please enter a valid email address');

  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  // Don't reveal whether the account exists — always return success
  if (!user) {
    return { message: 'If an account exists with this email, you will receive an OTP shortly.' };
  }

  const isRateLimited = await checkOTPRateLimit(user.user_id, 60, 5);
  if (isRateLimited) {
    throw new Error('Too many requests. Please try again after 1 hour.');
  }

  const otp = await createOTP(user.user_id);
  await sendPasswordResetEmail(user.email, otp, user.full_name || 'User');
  // ↑ Reuses your existing email template. Optionally create a sendPasswordResetEmail variant.

  return { message: 'If an account exists with this email, you will receive an OTP shortly.' };
};

/**
 * Reset password using OTP
 */
export const resetPassword = async (email: string, otp_code: string, new_password: string) => {
  if (!email || !otp_code || !new_password) {
    throw new Error('Email, OTP, and new password are required');
  }

  const passwordValidation = validatePassword(new_password);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message || 'Invalid password');
  }

  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!user) throw new Error('Invalid or expired OTP.');  // Don't reveal account existence

  await validateOTP(user.user_id, otp_code);  // throws if invalid/expired

  const hashedPassword = await hashPassword(new_password);

  await prisma.users.update({
    where: { user_id: user.user_id },
    data: { password_hash: hashedPassword }
  });

  await markOTPAsUsed(user.user_id, otp_code);

  return { message: 'Password reset successful! You can now log in.' };
};