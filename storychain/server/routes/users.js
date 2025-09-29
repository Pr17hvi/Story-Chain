import express from "express";
import { getUserProfile } from "../controllers/users.js";

const router = express.Router();

// Public route: fetch user profile by username
// GET /api/users/:username
router.get("/:username", getUserProfile);

export default router;
