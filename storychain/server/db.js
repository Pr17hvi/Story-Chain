import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

let db;

if (process.env.DATABASE_URL) {
  // ✅ Render (production)
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  console.log("🌐 Using production database connection");
} else {
  // ✅ Local development
  db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: false,
  });
  console.log("💻 Using local database connection");
}

// 🔎 Test connection
(async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
})();

// 🛑 Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await db.end();
    console.log("🔌 Database pool closed");
    process.exit(0);
  } catch (err) {
    console.error("⚠️ Error closing database pool:", err.message);
    process.exit(1);
  }
});

export default db;
