import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

// For Vercel serverless functions
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

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  // Global error handlers
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[UNHANDLED REJECTION]", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("[UNCAUGHT EXCEPTION]", error);
  });

  const startServer = async () => {
    try {
      await connectDatabase();
      app.listen(PORT, () => {
        console.log(`HireScore backend running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start backend:", error.message);
      process.exit(1);
    }
  };

  startServer();
}
