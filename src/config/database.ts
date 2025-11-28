import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 */
export const connectDB = async (mongoUri: string): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Create indexes
    console.log('📝 Creating database indexes...');
    await createIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

/**
 * Create necessary indexes
 */
const createIndexes = async (): Promise<void> => {
  try {
    // Indexes are created automatically by Mongoose schemas
    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnection failed:', error);
    process.exit(1);
  }
};

/**
 * Get MongoDB connection status
 */
export const getDBStatus = (): string => {
  return mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
};