// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js"; // ✅ IMPORT DB

dotenv.config();
const app = express();

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// 🔥 AUTO INIT DATABASE
// =======================
const initializeDatabase = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS paragraphs (
        id SERIAL PRIMARY KEY,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (story_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS paragraph_votes (
        id SERIAL PRIMARY KEY,
        paragraph_id INTEGER REFERENCES paragraphs(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (paragraph_id, user_id)
      );
    `);

    console.log("✅ Database tables initialized");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message || err);
  }
};

// Run once at startup
initializeDatabase();

// =======================
// ROUTES IMPORT
// =======================
import authRoutes from "./routes/auth.js";
import storiesRoutes from "./routes/stories.js";
import voteRoutes from "./routes/votes.js";
import paragraphVoteRoutes from "./routes/paragraphVotes.js";
import userRoutes from "./routes/users.js";

// =======================
// CORS SETUP
// =======================
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URLS) {
    return process.env.FRONTEND_URLS.split(",").map((u) => u.trim());
  }
  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
  ];
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("🚫 Blocked CORS request from:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =======================
// API ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/paragraph-votes", paragraphVoteRoutes);
app.use("/api/users", userRoutes);

// 404 for unknown API routes
app.use("/api/*", (req, res) =>
  res.status(404).json({ error: "API route not found" })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "🚀 StoryChain backend running" });
});

// =======================
// SERVE FRONTEND
// =======================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../client/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error("🔥 Global error:", err.message || err);
  if (req.path?.startsWith("/api")) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
  next(err);
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("🌍 Allowed origins:", allowedOrigins.join(", "));
});
