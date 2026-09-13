const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    console.log('Connected to PostgreSQL');
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeDatabase };
