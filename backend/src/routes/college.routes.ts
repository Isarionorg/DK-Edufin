import express from "express";
import { getColleges, getCollegeDetails, getCollegeStates } from "../controllers/college.controller";
import { optionalAuthenticateToken, authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// GET /colleges         → optional auth (personalized if logged in, generic if not)
// GET /colleges/states  → public, must come before /:id or Express will treat "states" as an id param
// GET /colleges/:id     → public
router.get("/", optionalAuthenticateToken, getColleges);
router.get("/states", getCollegeStates);
router.get("/:id", getCollegeDetails);

export default router;