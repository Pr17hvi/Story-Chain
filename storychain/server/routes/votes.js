import express from "express";
import { toggleVote } from "../controllers/votes.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Toggle a vote on a story by ID
// POST /api/votes/:id
router.post("/:id", verifyToken, toggleVote);

export default router;
