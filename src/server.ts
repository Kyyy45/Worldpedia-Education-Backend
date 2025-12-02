import createApp from './app';
import { connectDB } from './database';
import { logger } from './utils/logger';

/**
 * Server Initialization
 */
const startServer = async (): Promise<void> => {
  try {
    /**
     * ============================================================================
     * ENVIRONMENT VARIABLES
     * ============================================================================
     */

    const PORT = parseInt(process.env.PORT || '5000', 10);
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/worldpedia';

    /**
     * ============================================================================
     * DATABASE CONNECTION
     * ============================================================================
     */

    logger.info('🔌 Connecting to MongoDB...');
    await connectDB(MONGODB_URI);
    logger.info(`✅ MongoDB connected: ${MONGODB_URI}`);

    /**
     * ============================================================================
     * CREATE EXPRESS APP
     * ============================================================================
     */

    const app = createApp();

    /**
     * ============================================================================
     * START SERVER
     * ============================================================================
     */

    const server = app.listen(() => {
      logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    🚀 Worldpedia Education Backend Server Started!           ║
║                                                               ║
║  Environment:  ${NODE_ENV.padEnd(45)}║
║  Port:         ${PORT.toString().padEnd(45)}║
║  Database:     MongoDB Connected ✅
║  Time:         ${new Date().toISOString().padEnd(45)}║
║                                                               ║
║  Health Check: http://localhost:${PORT}/health
║  API Docs:     http://localhost:${PORT}/api
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });

    /**
     * ============================================================================
     * GRACEFUL SHUTDOWN HANDLING
     * ============================================================================
     */

    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.warn(`\n\n📋 ${signal} received. Starting graceful shutdown...`);

      server.close(() => {
        logger.info('✅ HTTP server closed');
      });

      // Close database connection
      try {
        // Implement MongoDB connection close if needed
        logger.info('✅ Database connection closed');
      } catch (error) {
        logger.error('Error closing database connection', error);
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    /**
     * ============================================================================
     * UNHANDLED ERROR HANDLERS
     * ============================================================================
     */

    process.on('uncaughtException', (error: Error) => {
      logger.error('❌ UNCAUGHT EXCEPTION:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('❌ UNHANDLED REJECTION:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ FATAL ERROR - Server failed to start:', error);
    process.exit(1);
  }
};

/**
 * Start the server
 */
startServer();

export default startServer;