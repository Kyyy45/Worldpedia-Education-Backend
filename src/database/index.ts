import mongoose, { Connection } from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Global database connection reference
 */
let dbConnection: Connection | null = null;

/**
 * Connect to MongoDB Database
 */
export const connectDB = async (mongoUri: string): Promise<Connection> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      logger.info('📦 Already connected to MongoDB');
      return mongoose.connection;
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      socketTimeoutMS: 45000
    });

    dbConnection = mongoose.connection;

    // Setup connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB connection established');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error);
    });

    return dbConnection;
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB Database
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info('✅ Disconnected from MongoDB');
    }
  } catch (error) {
    logger.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Get database connection
 */
export const getDB = (): Connection | null => {
  return dbConnection || mongoose.connection;
};

/**
 * Check if database is connected
 */
export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export default {
  connectDB,
  disconnectDB,
  getDB,
  isDBConnected
};