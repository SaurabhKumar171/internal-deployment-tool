const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { pool } = require("./db");

async function initializeDatabase() {
  const [schemaSql, migrationSql] = await Promise.all([
    fs.readFile(path.join(__dirname, "init.sql"), "utf8"),
    fs.readFile(path.join(__dirname, "migration.sql"), "utf8"),
  ]);

  await pool.query(schemaSql);
  await pool.query(migrationSql);

  console.log("Database schema initialized");
}

initializeDatabase()
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
