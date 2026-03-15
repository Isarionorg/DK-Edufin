import { Router } from 'express';
import * as studentController from '../controllers/student.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.post('/profile/complete', studentController.completeProfile);
router.get('/profile', studentController.getProfile);
router.get('/profile/status', studentController.getProfileStatus);
router.get('/exams', studentController.getExams);
router.get('/courses', studentController.getCourses);
router.get('/categories', studentController.getCategories);

export default router;