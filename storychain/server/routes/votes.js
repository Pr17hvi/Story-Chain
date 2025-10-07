
// server/routes/votes.js
import express from "express";
import { toggleVote } from "../controllers/votes.js";

const router = express.Router();

router.post("/:id", toggleVote);

export default router;

