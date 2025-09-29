import db from "../db.js";

// Get a user profile with stories + contributions
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // 1. Find user
    const userResult = await db.query(
      "SELECT id, username, email, created_at FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];

    // 2. Fetch stories created by user
    const storiesResult = await db.query(
      `SELECT s.id, s.title, s.created_at,
        (SELECT COUNT(*)::int FROM votes v WHERE v.story_id = s.id) AS votes
       FROM stories s
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [user.id]
    );

    // 3. Fetch paragraphs contributed by user
    const paragraphsResult = await db.query(
      `SELECT p.id, p.content, p.created_at, 
              s.id AS story_id, s.title AS story_title,
              u.username AS author,
              (SELECT COUNT(*)::int FROM paragraph_votes pv WHERE pv.paragraph_id = p.id) AS votes
       FROM paragraphs p
       JOIN stories s ON p.story_id = s.id
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [user.id]
    );

    res.json({
      user,
      stories: storiesResult.rows,
      contributions: paragraphsResult.rows,
    });
  } catch (err) {
    console.error("Error fetching profile for", req.params.username, ":", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};
