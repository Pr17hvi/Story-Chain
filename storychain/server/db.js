// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

let db;

if (process.env.DATABASE_URL) {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  console.log("🌐 Using production database connection");
} else {
  db = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "storychain",
    password: process.env.DB_PASS || "",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    ssl: false,
  });
  console.log("💻 Using local database connection");
}

// Test connection once at startup
(async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection error:", err.message || err);
  }
})();

process.on("SIGINT", async () => {
  try {
    await db.end();
    console.log("🔌 Database pool closed");
    process.exit(0);
  } catch (err) {
    console.error("⚠️ Error closing database pool:", err.message || err);
    process.exit(1);
  }
});

export default db;
