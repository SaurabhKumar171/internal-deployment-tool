const { pool } = require("../db");
const { publishDeployEvent } = require("../kafka");

async function triggerDeploy(req, res) {
  const { server_id, branch } = req.body;

  if (!server_id || !branch) {
    return res.status(400).json({ error: "server_id and branch are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO deployments (server_id, user_id, branch, status) SELECT id, $2, $3, 'PENDING' FROM servers WHERE id = $1 AND user_id = $2 RETURNING id",
      [server_id, req.user.id, branch],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Server not found" });
    }

    const deploymentId = result.rows[0].id;
    await publishDeployEvent({ deploymentId, branch });

    return res.status(202).json({ deploymentId });
  } catch (error) {
    console.error("Failed to create deployment", error);
    return res.status(500).json({ error: "Failed to create deployment" });
  }
}

async function getDeployStatus(req, res) {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      "SELECT status, branch, logs FROM deployments WHERE id = $1 AND user_id = $2",
      [eventId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch deployment", error);
    return res.status(500).json({ error: "Failed to fetch deployment" });
  }
}

module.exports = { triggerDeploy, getDeployStatus };
