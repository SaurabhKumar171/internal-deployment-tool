const express = require("express");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();
const { pool, initializeDatabase } = require("./db");
const { initKafkaProducer, publishDeployEvent } = require("./kafka");
const swaggerSpec = require("./swagger");

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/v1/servers", async (req, res) => {
  const { name, ip_address, path } = req.body;

  if (!name || !ip_address || !path) {
    return res.status(400).json({ error: "name, ip_address, and path are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO servers (id, name, ip_address, path) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id, name, ip_address, path",
      [name, ip_address, path],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to create server", error);
    return res.status(500).json({ error: "Failed to create server" });
  }
});

app.get("/api/v1/servers", async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, name, ip_address, path FROM servers");
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch servers", error);
    return res.status(500).json({ error: "Failed to fetch servers" });
  }
});

app.post("/api/v1/deploy", async (req, res) => {
  const { server_id, branch } = req.body;

  if (!server_id || !branch) {
    return res.status(400).json({ error: "server_id and branch are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO deployments (server_id, branch, status) VALUES ($1, $2, 'PENDING') RETURNING id",
      [server_id, branch],
    );
    const deploymentId = result.rows[0].id;

    await publishDeployEvent({ deploymentId, branch });

    return res.status(202).json({ deploymentId });
  } catch (error) {
    console.error("Failed to create deployment", error);
    return res.status(500).json({ error: "Failed to create deployment" });
  }
});

app.get("/api/v1/deploy/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      "SELECT status, branch, logs FROM deployments WHERE id = $1",
      [eventId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch deployment", error);
    return res.status(500).json({ error: "Failed to fetch deployment" });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    await initKafkaProducer();

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize services", error);
    process.exit(1);
  }
}

startServer();
