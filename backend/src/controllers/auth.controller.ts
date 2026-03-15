// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

// ============================================
// TYPES
// ============================================

interface RegisterRequestBody {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

interface VerifyOTPRequestBody {
  email: string;
  otp_code: string;
}

interface ResendOTPRequestBody {
  email: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Standard success response format
 */
const successResponse = (res: Response, statusCode: number, data: any, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    message: message || 'Operation successful',
    data
  });
};

/**
 * Standard error response format
 */
const errorResponse = (res: Response, statusCode: number, message: string, error?: any) => {
  // Log error for debugging (in production, use proper logging service)
  if (error) {
    console.error('Error details:', error);
  }
  
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error?.message : undefined
  });
};

// ============================================
// AUTH CONTROLLERS
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send OTP
 * @access  Public
 * 
 * @body {
 *   email: string (required)
 *   password: string (required, min 8 chars, 1 uppercase, 1 number)
 *   full_name: string (required)
 *   phone: string (optional, 10 digits)
 * }
 * 
 * @returns {
 *   success: true,
 *   message: "Registration successful! Please check your email for the OTP.",
 *   data: {
 *     user_id: string,
 *     email: string,
 *     full_name: string
 *   }
 * }
 */
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  try {
    const { email, password, full_name, phone } = req.body;
    
    // Call service to register user
    const result = await authService.registerUser({
      email,
      password,
      full_name,
      phone
    });
    
    // Return success response
    return successResponse(res, 201, {
      user_id: result.user_id,
      email: result.email,
      full_name: result.full_name
    }, result.message);
    
  } catch (error: any) {
    // Handle specific errors
    if (error.message.includes('already exists')) {
      return errorResponse(res, 409, error.message, error);
    }
    
    if (error.message.includes('valid email') || 
        error.message.includes('password') || 
        error.message.includes('phone')) {
      return errorResponse(res, 400, error.message, error);
    }
    
    if (error.message.includes('verification email')) {
      return errorResponse(res, 503, 'Unable to send verification email. Please try again later.', error);
    }
    
    // Generic error
    return errorResponse(res, 500, 'Registration failed. Please try again.', error);
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and activate user account
 * @access  Public
 * 
 * @body {
 *   email: string (required)
 *   otp_code: string (required, 6 digits)
 * }
 * 
 * @returns {
 *   success: true,
 *   message: "Email verified successfully! Welcome to DK Edufin.",
 *   data: {
 *     token: string (JWT token, valid for 7 days),
 *     user: {
 *       user_id: string,
 *       email: string,
 *       full_name: string,
 *       phone: string | null,
 *       is_email_verified: boolean
 *     }
 *   }
 * }
 */
export const verifyOTP = async (req: Request<{}, {}, VerifyOTPRequestBody>, res: Response) => {
  try {
    const { email, otp_code } = req.body;
    
    // Validate input
    if (!email || !otp_code) {
      return errorResponse(res, 400, 'Email and OTP code are required');
    }
    
    // Call service to verify OTP
    const result = await authService.verifyOTP({
      email,
      otp_code
    });
    
    // Return success with token
    return successResponse(res, 200, {
      token: result.token,
      user: result.user
    }, result.message);
    
  } catch (error: any) {
    // Handle specific errors
    if (error.message.includes('No account found')) {
      return errorResponse(res, 404, error.message, error);
    }
    
    if (error.message.includes('already verified')) {
      return errorResponse(res, 400, error.message, error);
    }
    
    if (error.message.includes('Invalid OTP') || error.message.includes('expired')) {
      return errorResponse(res, 400, error.message, error);
    }
    
    // Generic error
    return errorResponse(res, 500, 'OTP verification failed. Please try again.', error);
  }
};

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user's email
 * @access  Public
 * 
 * @body {
 *   email: string (required)
 * }
 * 
 * @returns {
 *   success: true,
 *   message: "OTP has been resent to your email. Please check your inbox.",
 *   data: null
 * }
 */
export const resendOTP = async (req: Request<{}, {}, ResendOTPRequestBody>, res: Response) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }
    
    // Call service to resend OTP
    const result = await authService.resendOTP(email);
    
    // Return success
    return successResponse(res, 200, null, result.message);
    
  } catch (error: any) {
    // Handle specific errors
    if (error.message.includes('No account found')) {
      return errorResponse(res, 404, error.message, error);
    }
    
    if (error.message.includes('already verified')) {
      return errorResponse(res, 400, error.message, error);
    }
    
    if (error.message.includes('verification email')) {
      return errorResponse(res, 503, 'Unable to send OTP. Please try again later.', error);
    }
    
    // Generic error
    return errorResponse(res, 500, 'Failed to resend OTP. Please try again.', error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 * 
 * @body {
 *   email: string (required)
 *   password: string (required)
 * }
 * 
 * @returns {
 *   success: true,
 *   message: "Login successful! Welcome back.",
 *   data: {
 *     token: string (JWT token, valid for 7 days),
 *     user: {
 *       user_id: string,
 *       email: string,
 *       full_name: string,
 *       phone: string | null,
 *       is_email_verified: boolean
 *     }
 *   }
 * }
 */
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }
    
    // Call service to login user
    const result = await authService.loginUser({
      email,
      password
    });
    
    // Return success with token
    return successResponse(res, 200, {
      token: result.token,
      user: result.user
    }, result.message);
    
  } catch (error: any) {
    // Handle specific errors
    if (error.message.includes('Invalid email or password')) {
      return errorResponse(res, 401, error.message, error);
    }
    
    if (error.message.includes('verify your email')) {
      return errorResponse(res, 403, error.message, error);
    }
    
    // Generic error
    return errorResponse(res, 500, 'Login failed. Please try again.', error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Protected (requires JWT token)
 * 
 * @headers {
 *   Authorization: Bearer <token>
 * }
 * 
 * @returns {
 *   success: true,
 *   message: "User profile retrieved successfully",
 *   data: {
 *     user_id: string,
 *     email: string,
 *     full_name: string,
 *     phone: string | null,
 *     is_email_verified: boolean,
 *     created_at: Date
 *   }
 * }
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User ID comes from auth middleware (req.user)
    const userId = (req as any).user?.user_id;
    
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized. Please login.');
    }
    
    // Get user from database
    const user = await authService.getUserById(userId);
    
    // Return user profile
    return successResponse(res, 200, user, 'User profile retrieved successfully');
    
  } catch (error: any) {
    if (error.message.includes('User not found')) {
      return errorResponse(res, 404, 'User not found', error);
    }
    
    return errorResponse(res, 500, 'Failed to fetch user profile', error);
  }
};

/**
 * Alias for getCurrentUser (backward compatibility)
 */
export const getProfile = getCurrentUser;

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token deletion)
 * @access  Public
 * 
 * Note: JWT tokens are stateless, so logout is handled client-side
 * by deleting the token. This endpoint exists for consistency and
 * future server-side logout implementation (e.g., token blacklisting)
 * 
 * @returns {
 *   success: true,
 *   message: "Logout successful",
 *   data: null
 * }
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // The client should delete the token from localStorage/cookies
    
    // For now, just return success
    // In future, you can implement token blacklisting here
    
    return successResponse(res, 200, null, 'Logout successful. Please delete your token.');
    
  } catch (error: any) {
    return errorResponse(res, 500, 'Logout failed', error);
  }
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * @route   GET /api/auth/health
 * @desc    Check if auth service is running
 * @access  Public
 * 
 * @returns {
 *   success: true,
 *   message: "Auth service is running",
 *   data: {
 *     status: "healthy",
 *     timestamp: Date,
 *     environment: string
 *   }
 * }
 */
export const healthCheck = async (req: Request, res: Response) => {
  return successResponse(res, 200, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'auth'
  }, 'Auth service is running');
};