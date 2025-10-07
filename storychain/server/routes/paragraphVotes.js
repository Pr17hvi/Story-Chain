
// server/routes/paragraphVotes.js
import express from "express";
import { toggleParagraphVote } from "../controllers/paragraphVotes.js";

const router = express.Router();

router.post("/:id", toggleParagraphVote);

export default router;

