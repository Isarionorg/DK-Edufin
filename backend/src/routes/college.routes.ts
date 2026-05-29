import express from "express";
import { getColleges, getCollegeDetails } from "../controllers/college.controller";
import { optionalAuthenticateToken, authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// GET /colleges     → optional auth (personalized if logged in, generic if not)
// GET /colleges/:id → public
router.get("/", optionalAuthenticateToken, getColleges);
router.get("/:id", getCollegeDetails);

export default router;