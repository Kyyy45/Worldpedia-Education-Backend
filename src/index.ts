/**
 * WORLDPEDIA EDUCATION BACKEND
 * Main Entry Point
 *
 * This is the starting point of the application.
 * Loads environment variables and starts the server.
 */

import dotenv from 'dotenv';
import path from 'path';

/**
 * Load environment variables
 */
const envPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../.env.production')
  : path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

/**
 * Start the server
 */
import('./server').catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export {};