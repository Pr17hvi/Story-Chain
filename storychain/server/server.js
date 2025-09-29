import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import storiesRoutes from "./routes/stories.js";
import voteRoutes from "./routes/votes.js";
import paragraphVoteRoutes from "./routes/paragraphVotes.js";
import userRoutes from "./routes/users.js";

dotenv.config();
const app = express();

// Needed for serving frontend build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL // e.g. "https://yourdomain.com"
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/paragraph-votes", paragraphVoteRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StoryChain backend running 🚀" });
});

// ✅ Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "client", "dist"); // adjust if different
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
