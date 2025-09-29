import db from "../db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// 📌 Get all stories with author + votes
export const getStories = async (req, res) => {
  try {
    const query = `
      SELECT s.id, s.title, s.created_at, u.username AS author,
      (SELECT COUNT(*)::int FROM votes v WHERE v.story_id = s.id) AS votes
      FROM stories s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `;
    const result = await db.query(query);
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching stories:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Get story by ID with paragraphs + votes + userHasVoted
export const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    let userId = null;
    const token = req.cookies?.access_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch {
        userId = null;
      }
    }

    const storyQuery = `
      SELECT s.id, s.title, s.user_id, s.created_at, 
             u.username AS author,
             (SELECT COUNT(*)::int FROM votes v WHERE v.story_id = s.id) AS votes,
             EXISTS (
               SELECT 1 FROM votes v WHERE v.story_id = s.id AND v.user_id = $2
             ) AS "userHasVoted"
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;
    const storyResult = await db.query(storyQuery, [id, userId]);
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }
    const story = storyResult.rows[0];

    // paragraphs with votes + userHasVoted
    const paraQuery = `
      SELECT p.id, p.content, p.created_at, p.user_id, 
             u.username AS author,
             (SELECT COUNT(*)::int FROM paragraph_votes pv WHERE pv.paragraph_id = p.id) AS votes,
             EXISTS (
               SELECT 1 FROM paragraph_votes pv WHERE pv.paragraph_id = p.id AND pv.user_id = $2
             ) AS "userHasVoted"
      FROM paragraphs p
      JOIN users u ON p.user_id = u.id
      WHERE p.story_id = $1
      ORDER BY p.created_at ASC
    `;
    const paraResult = await db.query(paraQuery, [id, userId]);
    story.paragraphs = paraResult.rows;

    return res.json(story);
  } catch (err) {
    console.error("Error fetching story by id:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Create story + first paragraph
export const createStory = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const storyQuery = `
      INSERT INTO stories (title, user_id)
      VALUES ($1, $2)
      RETURNING id, title, created_at
    `;
    const storyResult = await db.query(storyQuery, [title, decoded.id]);
    const storyId = storyResult.rows[0].id;

    const paraQuery = `
      INSERT INTO paragraphs (story_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
    `;
    const paraResult = await db.query(paraQuery, [storyId, decoded.id, content]);

    return res.status(201).json({
      ...storyResult.rows[0],
      firstParagraph: paraResult.rows[0],
    });
  } catch (err) {
    console.error("Error creating story:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Add paragraph to story
export const addParagraph = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const { content } = req.body;
    const { id: storyId } = req.params;

    if (!content) return res.status(400).json({ error: "Content is required" });

    const insertQuery = `
      INSERT INTO paragraphs (story_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, story_id, user_id, content, created_at
    `;
    const result = await db.query(insertQuery, [storyId, decoded.id, content]);

    const paraWithMeta = await db.query(
      `
      SELECT p.id, p.story_id, p.user_id, p.content, p.created_at, u.username AS author,
      (SELECT COUNT(*)::int FROM paragraph_votes pv WHERE pv.paragraph_id = p.id) AS votes,
      FALSE AS "userHasVoted"
      FROM paragraphs p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
      `,
      [result.rows[0].id]
    );

    return res.status(201).json(paraWithMeta.rows[0]);
  } catch (err) {
    console.error("Error adding paragraph:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Delete story (author only)
export const deleteStory = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.id;
    const { id } = req.params;

    const check = await db.query("SELECT user_id FROM stories WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Story not found" });
    if (check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not allowed to delete this story" });
    }

    await db.query("DELETE FROM stories WHERE id = $1", [id]);
    return res.json({ message: "Story deleted successfully" });
  } catch (err) {
    console.error("Error deleting story:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Delete paragraph (author only)
export const deleteParagraph = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.id;
    const { id } = req.params;

    const check = await db.query("SELECT user_id FROM paragraphs WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Paragraph not found" });
    if (check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not allowed to delete this paragraph" });
    }

    await db.query("DELETE FROM paragraphs WHERE id = $1", [id]);
    return res.json({ message: "Paragraph deleted successfully" });
  } catch (err) {
    console.error("Error deleting paragraph:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
