import express from "express";
import { toggleVote } from "../controllers/votes.js";   // ✅ fixed path
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:id", verifyToken, toggleVote);  // keep original route

export default router;
