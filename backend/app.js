import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import resumeRoutes from "./routes/resume.routes.js";
import studentRoutes from "./routes/student.routes.js";
import authRoutes from "./routes/auth.routes.js";
import verificationRoutes from "./phase2-verification/routes/verification.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", module: "hirescore-backend" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/verify", verificationRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
