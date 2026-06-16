const { Pool } = require('pg');
require('dotenv').config();

// Graceful check for PG connection credentials
const isConfigured = process.env.DB_HOST && process.env.DB_USER && process.env.DB_DATABASE;

let pool = null;

if (isConfigured) {
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('connect', () => {
    console.log('PostgreSQL database pool connected successfully.');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client pool', err);
  });
} else {
  console.warn('⚠️ WARNING: PostgreSQL connection variables are not fully configured in backend/.env.');
  console.warn('Backend API will run in sandbox mode using memory or JSON structures.');
}

module.exports = {
  query: async (text, params) => {
    if (!pool) {
      throw new Error("PostgreSQL client pool is not initialized. Run in mock fallback sandbox mode.");
    }
    return pool.query(text, params);
  },
  pool,
  isConfigured: !!pool
};
