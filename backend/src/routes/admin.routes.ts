// admin panel routes to be added here
import { Router } from "express";
import { getStats } from "../controllers/admin/stats.controller";
import { createCollege, getColleges } from "../controllers/admin/colleges.controller";
import { createCourse, getCourses } from "../controllers/admin/courses.controller";
import { createCollegeCourse, getCollegeCourses } from "../controllers/admin/collegecourses.controller";
import { createCutoff, getCutoffs } from "../controllers/admin/cutoffs.controller";
import { bulkUpload } from "../controllers/admin/bulkupload.controller";

const router = Router();

// Stats
router.get("/stats", getStats);

// Colleges
router.get("/colleges", getColleges);
router.post("/colleges", createCollege);

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

export default router;