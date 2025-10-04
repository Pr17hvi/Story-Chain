import express from "express";
import { toggleParagraphVote } from "../controllers/paragraphVotes.js";  // ✅ fixed path
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:id", verifyToken, toggleParagraphVote);

export default router;
