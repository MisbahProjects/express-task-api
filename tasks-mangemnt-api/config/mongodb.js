import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectDB() {
  if (!process.env.MONGODB_URL) {
    throw new Error("❌ MONGODB_URL not set in .env");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME || "taskdb",
    });

    console.log(" MongoDB connected");
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
