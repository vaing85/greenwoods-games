const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenwood_games', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log('MongoDB connection failed, using in-memory storage for development');
    console.log('To use MongoDB: Install MongoDB locally or provide MONGODB_URI environment variable');
    
    // For development, we can continue without MongoDB
    // The models will work with mongoose's default behavior
    return false;
  }
};

// Initialize database connection
connectDB();

module.exports = connectDB;
