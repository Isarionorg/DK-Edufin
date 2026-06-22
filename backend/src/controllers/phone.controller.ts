import { Request, Response } from "express";
import { sendPhoneOtp, checkPhoneOtp } from "../services/twilio.service";
import { prisma } from "../lib/prisma";

interface AuthRequest extends Request {
  user?: { user_id: string };
}

const successResponse = (res: Response, message: string, data?: object) =>
  res.status(200).json({ success: true, message, ...data });

const errorResponse = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, message });

export const sendOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) { errorResponse(res, 401, "Unauthorized"); return; }

    const { phone } = req.body;
    if (!phone) { errorResponse(res, 400, "Phone number is required"); return; }

    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      errorResponse(res, 400, "Invalid Indian phone number"); return;
    }

    // Normalize: ensure +91 prefix for Twilio
    const normalizedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    // Check if already verified (guard against re-verification)
    const user = await prisma.users.findUnique({ where: { user_id: userId } });
    if (user?.phone_verified) {
      errorResponse(res, 400, "Phone number already verified"); return;
    }

    await sendPhoneOtp(normalizedPhone);
    successResponse(res, "OTP sent successfully");
  } catch (error) {
    console.error("sendOtp error:", error);
    errorResponse(res, 500, "Failed to send OTP");
  }
};

export const verifyOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) { errorResponse(res, 401, "Unauthorized"); return; }

    const { phone, code } = req.body;
    if (!phone || !code) { errorResponse(res, 400, "Phone and OTP code are required"); return; }

    const normalizedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    const approved = await checkPhoneOtp(normalizedPhone, code);
    if (!approved) { errorResponse(res, 400, "Invalid or expired OTP"); return; }

    // Mark phone verified and save phone number
    await prisma.users.update({
      where: { user_id: userId },
      data: { phone: normalizedPhone, phone_verified: true },
    });

    successResponse(res, "Phone number verified successfully");
  } catch (error) {
    console.error("verifyOtp error:", error);
    errorResponse(res, 500, "Failed to verify OTP");
  }
};