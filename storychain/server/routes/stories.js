import express from "express";
import {
  getStories,
  getStoryById,
  createStory,
  addParagraph,
  deleteStory,
  deleteParagraph,
} from "../controllers/stories.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get all stories
router.get("/", getStories);

// Get story by id
router.get("/:id", getStoryById);

// Create new story (requires login)
router.post("/", verifyToken, createStory);

// Add paragraph to story
router.post("/:id/paragraphs", verifyToken, addParagraph);

// Delete story
router.delete("/:id", verifyToken, deleteStory);

// Delete paragraph
router.delete("/paragraphs/:id", verifyToken, deleteParagraph);

export default router;
