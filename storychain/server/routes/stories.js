import express from "express";
import {
  getStories,
  getStoryById,
  createStory,
  addParagraph,
  deleteStory,
  deleteParagraph,
} from "../controllers/stories.js";   // ✅ fixed path

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getStories);
router.get("/:id", getStoryById);
router.post("/", verifyToken, createStory);
router.post("/:id/paragraphs", verifyToken, addParagraph);
router.delete("/:id", verifyToken, deleteStory);
router.delete("/paragraph/:id", verifyToken, deleteParagraph);

export default router;
