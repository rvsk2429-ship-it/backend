import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB. Please verify MONGODB_URI.", error);
    throw error;
  }
};

