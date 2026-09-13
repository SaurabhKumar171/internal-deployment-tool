const { pool } = require("../db");

async function createServer(req, res) {
  const { name, ip_address, path } = req.body;

  if (!name || !ip_address || !path) {
    return res.status(400).json({ error: "name, ip_address, and path are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO servers (id, user_id, name, ip_address, path) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id, user_id, name, ip_address, path",
      [req.user.id, name, ip_address, path],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to create server", error);
    return res.status(500).json({ error: "Failed to create server" });
  }
}

async function getServers(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, user_id, name, ip_address, path FROM servers WHERE user_id = $1",
      [req.user.id],
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch servers", error);
    return res.status(500).json({ error: "Failed to fetch servers" });
  }
}

module.exports = { createServer, getServers };
