/**
 * Validation Rules for Auth Routes
 * Using express-validator
 */

import { body, ValidationChain } from 'express-validator';

export const authValidation = {
  /**
   * Register validation
   */
  register: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
    body('full_name')
      .notEmpty()
      .withMessage('Full name is required')
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('Full name must be between 2 and 255 characters'),
    body('phone')
      .optional()
      .matches(/^(\+91)?[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit Indian mobile number')
  ] as ValidationChain[],

  /**
   * Verify OTP validation
   */
  verifyOTP: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('otp_code')
      .notEmpty()
      .withMessage('OTP code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits')
      .isNumeric()
      .withMessage('OTP must contain digits only')
  ] as ValidationChain[],

  /**
   * Resend OTP validation
   */
  resendOTP: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ] as ValidationChain[],

  /**
   * Login validation
   */
  login: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ] as ValidationChain[]
};