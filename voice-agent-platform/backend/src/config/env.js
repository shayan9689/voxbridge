/**
 * Environment configuration.
 * Loads and validates env vars; defaults for development.
 */

require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validate required vars in production (extend as needed)
if (env.NODE_ENV === 'production') {
  // Example: if (process.env.SOME_SECRET) env.SOME_SECRET = process.env.SOME_SECRET;
}

module.exports = env;
