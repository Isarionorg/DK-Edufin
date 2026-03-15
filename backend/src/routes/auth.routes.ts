import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { authValidation } from '../utils/validators';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(authValidation.register), authController.register);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP
 * @access  Public
 */
router.post('/verify-otp', validate(authValidation.verifyOTP), authController.verifyOTP);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP to user's email
 * @access  Public
 */
router.post('/resend-otp', validate(authValidation.resendOTP), authController.resendOTP);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(authValidation.login), authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router;