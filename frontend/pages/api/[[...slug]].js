import dotenv from "dotenv";
import app from "../app.js";
import { connectDatabase } from "../config/database.js";

dotenv.config();

export default async function handler(req, res) {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectDatabase();
    }

    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}