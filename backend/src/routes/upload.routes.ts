import { Router } from 'express';
// Import controllers (to be created)
// import * as uploadController from '../controllers/upload.controller';

// Import middlewares
// import { authenticate } from '../middlewares/auth.middleware';
// import { uploadLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

/**
 * @route   POST /api/v1/upload/image
 * @desc    Upload image to Cloudinary
 * @access  Private
 */
router.post('/image', (_req, res) => {
  // authenticate, uploadLimiter, uploadController.uploadImage
  res.status(501).json({ message: 'Upload image endpoint - To be implemented' });
});

/**
 * @route   POST /api/v1/upload/images
 * @desc    Upload multiple images
 * @access  Private
 */
router.post('/images', (_req, res) => {
  // authenticate, uploadLimiter, uploadController.uploadMultipleImages
  res.status(501).json({ message: 'Upload multiple images endpoint - To be implemented' });
});

/**
 * @route   POST /api/v1/upload/file
 * @desc    Upload file (PDF, DOC, etc.)
 * @access  Private
 */
router.post('/file', (_req, res) => {
  // authenticate, uploadLimiter, uploadController.uploadFile
  res.status(501).json({ message: 'Upload file endpoint - To be implemented' });
});

/**
 * @route   DELETE /api/v1/upload/:publicId
 * @desc    Delete uploaded file from Cloudinary
 * @access  Private
 */
router.delete('/:publicId', (_req, res) => {
  // authenticate, uploadController.deleteFile
  res.status(501).json({ message: 'Delete file endpoint - To be implemented' });
});

export default router;