import mongoose from 'mongoose';

const dbconnection = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/greencity";
  try {
    await mongoose.connect(mongoUri);
    console.log("mongoose connected sucessfully to " + (process.env.MONGO_URI ? "Atlas" : "local"));
  } catch (error) {
    console.log("Atlas connection failed, trying local...");
    try {
      await mongoose.connect("mongodb://localhost:27017/greencity");
      console.log("mongoose connected successfully to local");
    } catch (localError) {
      console.log("Local connection also failed:", localError.message);
      process.exit(1);
    }
  }
}


export default dbconnection
