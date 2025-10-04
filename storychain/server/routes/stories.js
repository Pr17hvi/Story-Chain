// routes/stories.js
import express from "express";
import {
  getStories,
  getStoryById,
  createStory,
  addParagraph,
  deleteStory,
  deleteParagraph,
} from "../stories.js";

import verifyToken from "../verifyToken.js";

const router = express.Router();

router.get("/", getStories);
router.get("/:id", getStoryById);
router.post("/", verifyToken, createStory); // create story (auth required)
router.post("/:id/paragraphs", verifyToken, addParagraph);
router.delete("/:id", verifyToken, deleteStory);
router.delete("/paragraph/:id", verifyToken, deleteParagraph);

export default router;
