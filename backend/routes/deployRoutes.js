const express = require("express");
const auth = require("../middleware/auth");
const { triggerDeploy, getDeployStatus } = require("../controllers/deployController");

const router = express.Router();

router.post("/", auth, triggerDeploy);
router.get("/:eventId", auth, getDeployStatus);

module.exports = router;
