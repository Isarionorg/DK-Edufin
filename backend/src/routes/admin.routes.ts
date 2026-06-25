// admin panel routes to be added here
import { Router } from "express";
import { getStats } from "../controllers/admin/stats.controller";
// import { createCollege, getColleges } from "../controllers/admin/colleges.controller";
import { createCourse, getCourses } from "../controllers/admin/courses.controller";
import { createCollegeCourse, getCollegeCourses } from "../controllers/admin/collegecourses.controller";
import { createCutoff, getCutoffs } from "../controllers/admin/cutoffs.controller";
import { bulkUpload } from "../controllers/admin/bulkupload.controller";
import { createExam, getExams } from "../controllers/admin/exam.controller";
import { createCollege, getColleges, updateCollege, deleteCollege } from "../controllers/admin/colleges.controller";
import { getUsers } from "../controllers/admin/users.controller";
import { adminLogin , adminVerify } from "../controllers/admin/auth.controller";
import { requireAdminAuth } from '../middlewares/adminAuth.middleware';
const router = Router();

router.post('/auth/login', adminLogin);
router.get('/auth/verify', adminVerify);

router.use(requireAdminAuth);
// Stats
router.get("/stats", getStats);

// Colleges
router.get("/colleges", getColleges);
router.post("/colleges", createCollege);
router.put("/colleges/:id", updateCollege);
router.delete("/colleges/:id", deleteCollege);

// Courses
router.get("/courses", getCourses);
router.post("/courses", createCourse);

// College-Course links
router.get("/college-courses", getCollegeCourses);
router.post("/college-courses", createCollegeCourse);

// Cutoffs
router.get("/cutoffs", getCutoffs);
router.post("/cutoffs", createCutoff);

// Bulk upload
router.post("/bulk-upload", bulkUpload);

//userinfo
router.get('/users', getUsers);

// Exams
router.get("/exams", getExams);
router.post("/exams", createExam);
export default router;