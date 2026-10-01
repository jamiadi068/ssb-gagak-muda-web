const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const db = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "gagakmuda_db_new",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || 5432,

  // Neon/Vercel membutuhkan SSL
  ...(isProduction && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

db.connect()
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.error("DB Connection Error:", err.message));

module.exports = db;