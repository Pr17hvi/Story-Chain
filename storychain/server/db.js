import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

let db;

if (process.env.DATABASE_URL) {
  // ✅ Render (production) – SSL required
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // ✅ Local dev – NO SSL
  db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: false, // <-- force off
  });
}

db.query("SELECT NOW()")
  .then((res) => console.log("✅ Connected to PostgreSQL at:", res.rows[0].now))
  .catch((err) => console.error("❌ Database connection error:", err));

process.on("SIGINT", async () => {
  await db.end();
  console.log("🔌 Database pool closed");
  process.exit(0);
});

export default db;

