import mongoose from 'mongoose';

const dbconnection = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/greencity";
  const options = {
    maxPoolSize: 100, // Handle high concurrency for 1M+ user loads
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(mongoUri, options);
    console.log("✅ Mongoose connected successfully to " + (process.env.MONGO_URI ? "Atlas" : "local"));
  } catch (error) {
    console.error("❌ Atlas connection failed, trying local...");
    try {
      await mongoose.connect("mongodb://localhost:27017/greencity", options);
      console.log("✅ Mongoose connected successfully to local");
    } catch (localError) {
      console.error("❌ Local connection also failed:", localError.message);
      process.exit(1);
    }
  }
}



export default dbconnection
