
// server/controllers/auth.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const isProduction = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// --- REGISTER ---
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    // Check if user exists
    const existing = await db.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, hash]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ user: newUser.rows[0], token });
  } catch (err) {
    console.error("❌ Register error:", err.message || err);
    if (err.code === "23505")
      return res
        .status(400)
        .json({ error: "Email or username already registered" });
    res.status(500).json({ error: "Something went wrong" });
  }
};

// --- LOGIN ---
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "All fields are required" });

    const userRes = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (userRes.rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        user: { id: user.id, username: user.username, email: user.email },
        token,
      });
  } catch (err) {
    console.error("❌ Login error:", err.message || err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// --- LOGOUT ---
export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};

// --- optional: get current user from token ---
export const me = async (req, res) => {
  try {
    // If verifyToken middleware used, req.user will be available
    const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const userRes = await db.query("SELECT id, username, email, created_at FROM users WHERE id = $1", [decoded.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json({ user: userRes.rows[0] });
  } catch (err) {
    console.error("❌ /auth/me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

