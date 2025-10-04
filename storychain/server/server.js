// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes (these route files are provided below)
import authRoutes from "./routes/auth.js";
import storiesRoutes from "./routes/stories.js";
import voteRoutes from "./routes/votes.js";
import paragraphVoteRoutes from "./routes/paragraphVotes.js";
import userRoutes from "./routes/users.js";

// --- CORS setup ---
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URLS) {
    return process.env.FRONTEND_URLS.split(",").map((u) => u.trim());
  }
  // local dev origins (Vite, CRA, etc.)
  return ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"];
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("Blocked CORS request from:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/paragraph-votes", paragraphVoteRoutes);
app.use("/api/users", userRoutes);

// If an API route is not matched, return JSON 404 (prevents index.html being returned)
app.use("/api/*", (req, res) => {
  return res.status(404).json({ error: "API route not found" });
});

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", message: "StoryChain backend running 🚀" })
);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../client/dist");
  app.use(express.static(frontendPath));

  // Only serve index.html for non-API GET requests (safe catch-all)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Global error handler (returns JSON for API requests)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err && err.message ? err.message : err);
  if (req.path && req.path.startsWith("/api")) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins.join(", "));
});
