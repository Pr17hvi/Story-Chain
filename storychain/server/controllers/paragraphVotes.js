import db from "../db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const toggleParagraphVote = async (req, res) => {
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
    const { id: paragraphId } = req.params;

    // Check if user has already voted
    const existing = await db.query(
      "SELECT id FROM paragraph_votes WHERE paragraph_id = $1 AND user_id = $2",
      [paragraphId, userId]
    );

    if (existing.rows.length > 0) {
      // Remove vote
      await db.query(
        "DELETE FROM paragraph_votes WHERE paragraph_id = $1 AND user_id = $2",
        [paragraphId, userId]
      );
    } else {
      // Add vote
      await db.query(
        "INSERT INTO paragraph_votes (paragraph_id, user_id) VALUES ($1, $2)",
        [paragraphId, userId]
      );
    }

    // Get updated count
    const countResult = await db.query(
      "SELECT COUNT(*)::int AS votes FROM paragraph_votes WHERE paragraph_id = $1",
      [paragraphId]
    );
    const votes = countResult.rows[0].votes;

    // Check if user has a vote now
    const checkResult = await db.query(
      "SELECT 1 FROM paragraph_votes WHERE paragraph_id = $1 AND user_id = $2",
      [paragraphId, userId]
    );
    const userHasVoted = checkResult.rows.length > 0;

    return res.json({ votes, userHasVoted });
  } catch (err) {
    console.error("Error toggling paragraph vote:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
