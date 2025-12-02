import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';
import { connectDB } from '../src/database';
import config from '../src/config/env';

// Inisialisasi app (Express) di luar handler agar bisa di-cache (warm start)
const app = createApp();

// Variable global untuk cache koneksi database di lingkungan serverless
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await connectDB(config.mongodbUri);
    isConnected = true;
    console.log('✅ MongoDB Connected (Cached)');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Pastikan koneksi DB tersambung sebelum memproses request apa pun
  await connectToDatabase();

  // 2. Teruskan request ke Express App
  // Casting 'req' dan 'res' karena tipe Vercel sedikit berbeda dengan Express, 
  // tapi kompatibel secara runtime.
  return app(req as any, res as any);
}