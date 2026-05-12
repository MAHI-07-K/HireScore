import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "./models/drive.model.js";
import "./models/resume.model.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import driveRoutes from "./routes/drive.routes.js";
import verificationRoutes from "./phase2-verification/routes/verification.routes.js";
import newVerificationRoutes from "./routes/verification.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isProduction) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow access from origin ${origin}`));
      }
    },
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
app.use("/api/admin", adminRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/phase2-verification", verificationRoutes);
app.use("/api/verification", newVerificationRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
