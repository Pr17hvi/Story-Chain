
// server/routes/users.js
import express from "express";
import { getUserProfile } from "../controllers/users.js";

const router = express.Router();

router.get("/:username", getUserProfile);

export default router;

