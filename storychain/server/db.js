import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Optional: health check query (keep for dev, remove in prod if noisy)
db.query("SELECT NOW()")
  .then(res => console.log("✅ Connected to PostgreSQL at:", res.rows[0].now))
  .catch(err => console.error("❌ Database connection error:", err));

// Graceful shutdown to release connections
process.on("SIGINT", async () => {
  await db.end();
  console.log("🔌 Database pool closed");
  process.exit(0);
});

export default db;
