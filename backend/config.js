// backend/config.js
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
configDotenv();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export { connectDB };
