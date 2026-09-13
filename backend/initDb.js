const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { pool } = require("./db");

async function initializeDatabase() {
  const sql = await fs.readFile(path.join(__dirname, "init.sql"), "utf8");

  await pool.query(sql);
  await pool.query(
    "INSERT INTO servers (name, ip_address, path) SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM servers WHERE name = $1)",
    ["demo-server", "192.0.2.10", "/var/www/demo-app"],
  );

  console.log("Database schema initialized and dummy server created");
}

initializeDatabase()
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
