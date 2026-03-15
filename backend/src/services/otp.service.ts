/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and store OTP for a user
 */
export const createOTP = async (userId: string): Promise<string> => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Mark any existing unused OTPs as expired
    await prisma.otp_verification.updateMany({
      where: {
        user_id: userId,
        is_used: false
      },
      data: {
        is_used: true // Mark as used to prevent multiple active OTPs
      }
    });

    // Store new OTP
    await prisma.otp_verification.create({
      data: {
        user_id: userId,
        otp_hash: otp,
        expires_at: expiresAt,
        is_used: false
      }
    });

    return otp;
  } catch (error) {
    console.error('Failed to create OTP:', error);
    throw new Error('Failed to generate OTP. Please try again.');
  }
};

/**
 * Validate OTP
 * Returns user ID if valid, throws error otherwise
 */
export const validateOTP = async (userId: string, otpCode: string): Promise<boolean> => {
  try {
    // Find the OTP record
    const otpRecord = await prisma.otp_verification.findFirst({
      where: {
        user_id: userId,
        otp_hash: otpCode,
        is_used: false
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!otpRecord) {
      throw new Error('Invalid OTP. Please check and try again.');
    }

    // Check if OTP is expired
    if (otpRecord.expires_at < new Date()) {
      throw new Error('OTP has expired. Please request a new one.');
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark OTP as used after successful verification
 */
export const markOTPAsUsed = async (userId: string, otpCode: string): Promise<void> => {
  try {
    await prisma.otp_verification.updateMany({
      where: {
        user_id: userId,
        otp_hash: otpCode,
        is_used: false
      },
      data: {
        is_used: true
      }
    });
  } catch (error) {
    console.error('Failed to mark OTP as used:', error);
    throw new Error('Failed to complete verification. Please try again.');
  }
};

/**
 * Get the most recent OTP for a user
 */
export const getRecentOTP = async (userId: string) => {
  try {
    const otpRecord = await prisma.otp_verification.findFirst({
      where: {
        user_id: userId,
        is_used: false
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return otpRecord;
  } catch (error) {
    console.error('Failed to get OTP:', error);
    return null;
  }
};

/**
 * Check if user has too many OTP requests in a short time
 * Returns true if limit exceeded
 */
export const checkOTPRateLimit = async (
  userId: string,
  timeWindowMinutes: number = 60,
  maxAttempts: number = 5
): Promise<boolean> => {
  try {
    const recentOTPs = await prisma.otp_verification.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(Date.now() - timeWindowMinutes * 60 * 1000)
        }
      }
    });

    return recentOTPs.length > maxAttempts;
  } catch (error) {
    console.error('Failed to check OTP rate limit:', error);
    return false;
  }
};
