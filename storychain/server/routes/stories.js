
// server/routes/stories.js
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

router.get("/", getStories);
router.get("/:id", getStoryById);
router.post("/", createStory); // createStory handles token from cookie or header
router.post("/:id/paragraphs", addParagraph);
router.delete("/:id", deleteStory);
router.delete("/paragraphs/:id", deleteParagraph);

export default router;

