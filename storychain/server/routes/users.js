// routes/users.js
import express from "express";
import { getUserProfile } from "../users.js";

const router = express.Router();

// public profile by username
router.get("/:username", getUserProfile);

export default router;
