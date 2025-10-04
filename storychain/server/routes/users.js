import express from "express";
import { getUserProfile } from "../controllers/users.js";  // ✅ fixed path

const router = express.Router();

router.get("/:username", getUserProfile);

export default router;
