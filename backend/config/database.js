import mongoose from "mongoose";

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }

  console.log("[DB] Connecting to MongoDB...");

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(uri);
  console.log(`[DB] MongoDB connected: ${connection.connection.host}`);
};
