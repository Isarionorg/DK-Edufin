import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/phone.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/send-otp", authenticateToken, sendOtp);
router.post("/verify-otp", authenticateToken, verifyOtp);

export default router;