import mongoose from "mongoose";

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
};
