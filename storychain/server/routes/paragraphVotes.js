import express from "express";
import { toggleParagraphVote } from "../controllers/paragraphVotes.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Explicit POST route for toggling votes
router.post("/:id", verifyToken, toggleParagraphVote);

export default router;
