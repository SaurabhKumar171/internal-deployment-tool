const express = require("express");
const auth = require("../middleware/auth");
const { createServer, getServers } = require("../controllers/serverController");

const router = express.Router();

router.post("/", auth, createServer);
router.get("/", auth, getServers);

module.exports = router;
