import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "./models/drive.model.js";
import "./models/resume.model.js";
import authRoutes from "./routes/auth.routes.js";
import verificationRoutes from "./phase2-verification/routes/verification.routes.js";
import newVerificationRoutes from "./routes/verification.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", module: "hirescore-backend" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/phase2-verification", verificationRoutes);
app.use("/api/verification", newVerificationRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
