import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AppError } from "../errors/AppError";

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

const successResponse = (res: Response, statusCode: number, data: any, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    message: message || "Operation successful",
    data,
  });
};

const errorResponse = (res: Response, statusCode: number, message: string, error?: any) => {
  if (error) console.error("Error details:", error);
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error?.message : undefined,
  });
};

/**
 * Central handler: if the service threw an AppError, use its status code.
 * Anything else is an unexpected 500.
 */
const handleServiceError = (res: Response, error: any, fallbackMessage: string) => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message, error);
  }
  return errorResponse(res, 500, fallbackMessage, error);
};

// ============================================
// AUTH CONTROLLERS
// ============================================

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  try {
    const { email, password, full_name, phone } = req.body;

    // Presence checks before touching the service
    if (!email?.trim())      return errorResponse(res, 400, "email is required");
    if (!password)           return errorResponse(res, 400, "password is required");
    if (!full_name?.trim())  return errorResponse(res, 400, "full_name is required");

    const result = await authService.registerUser({ email: email.trim(), password, full_name: full_name.trim(), phone });

    return successResponse(res, 201, {
      user_id: result.user_id,
      email: result.email,
      full_name: result.full_name,
    }, result.message);

  } catch (error: any) {
    return handleServiceError(res, error, "Registration failed. Please try again.");
  }
};

export const verifyOTP = async (req: Request<{}, {}, VerifyOTPRequestBody>, res: Response) => {
  try {
    const { email, otp_code } = req.body;

    if (!email?.trim()) return errorResponse(res, 400, "email is required");
    if (!otp_code?.trim()) return errorResponse(res, 400, "otp_code is required");

    const result = await authService.verifyOTP({ email: email.trim(), otp_code: otp_code.trim() });

    return successResponse(res, 200, { token: result.token, user: result.user }, result.message);

  } catch (error: any) {
    return handleServiceError(res, error, "OTP verification failed. Please try again.");
  }
};

export const resendOTP = async (req: Request<{}, {}, ResendOTPRequestBody>, res: Response) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) return errorResponse(res, 400, "email is required");

    const result = await authService.resendOTP(email.trim());

    return successResponse(res, 200, null, result.message);

  } catch (error: any) {
    return handleServiceError(res, error, "Failed to resend OTP. Please try again.");
  }
};

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return errorResponse(res, 400, "email is required");
    if (!password)      return errorResponse(res, 400, "password is required");

    const result = await authService.loginUser({ email: email.trim(), password });

    return successResponse(res, 200, { token: result.token, user: result.user }, result.message);

  } catch (error: any) {
    return handleServiceError(res, error, "Login failed. Please try again.");
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.user_id;

    // Should never happen if auth middleware is correct, but guard anyway
    if (!userId || typeof userId !== "string") {
      return errorResponse(res, 401, "Unauthorized. Please login.");
    }

    const user = await authService.getUserById(userId);

    return successResponse(res, 200, user, "User profile retrieved successfully");

  } catch (error: any) {
    return handleServiceError(res, error, "Failed to fetch user profile.");
  }
};

export const getProfile = getCurrentUser;

export const logout = async (req: Request, res: Response) => {
  return successResponse(res, 200, null, "Logout successful. Please delete your token.");
};

export const healthCheck = async (req: Request, res: Response) => {
  return successResponse(res, 200, {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    service: "auth",
  }, "Auth service is running");
};