
// server/controllers/votes.js
import db from "../db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Toggle vote (upvote/unvote)
export const toggleVote = async (req, res) => {
  try {
    const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.id;
    const { id } = req.params;
    const storyId = parseInt(id, 10);

    if (isNaN(storyId)) {
      return res.status(400).json({ error: "Invalid story id" });
    }

    // Try to remove vote first
    const removed = await db.query(
      "DELETE FROM votes WHERE story_id = $1 AND user_id = $2 RETURNING id",
      [storyId, userId]
    );

    if (removed.rows.length === 0) {
      // No existing vote → insert new
      await db.query(
        "INSERT INTO votes (story_id, user_id) VALUES ($1, $2)",
        [storyId, userId]
      );
    }

    // Always return updated count + userHasVoted
    const countRes = await db.query(
      "SELECT COUNT(*)::int AS votes FROM votes WHERE story_id = $1",
      [storyId]
    );
    const checkRes = await db.query(
      "SELECT 1 FROM votes WHERE story_id = $1 AND user_id = $2",
      [storyId, userId]
    );

    res.json({
      votes: Number(countRes.rows[0].votes),
      userHasVoted: checkRes.rows.length > 0,
    });
  } catch (err) {
    console.error("Error toggling vote:", err);
    res.status(500).json({ error: "Failed to toggle vote" });
  }
};

