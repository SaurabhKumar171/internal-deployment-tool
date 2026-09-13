const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const SALT_ROUNDS = 12;

async function registerUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email is already registered" });
    }

    console.error("Failed to register user", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({ error: "Authentication is not configured" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email],
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Failed to log in", error);
    return res.status(500).json({ error: "Failed to log in" });
  }
}

function logoutUser(_req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });

  return res.status(204).send();
}

async function getCurrentUser(req, res) {
  try {
    const result = await pool.query("SELECT id, email FROM users WHERE id = $1", [req.user.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch current user", error);
    return res.status(500).json({ error: "Failed to fetch current user" });
  }
}

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };
