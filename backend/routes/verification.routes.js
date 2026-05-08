import { Router } from "express";
import {
  getVerificationController,
  startVerificationController,
  uploadFileController,
  updateVerificationController,
  submitVerificationController,
  getHistoryController,
} from "../controllers/verification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadResume } from "../middleware/upload.middleware.js";

const router = Router();

// All routes are protected
router.use(protectRoute);

// GET verification data for a student
router.get("/:studentId", getVerificationController);

// GET verification history
router.get("/history/:studentId", getHistoryController);

// POST start verification
router.post("/start", startVerificationController);

// POST upload a file for verification
router.post("/upload", uploadResume.single("file"), uploadFileController);

// POST submit for full verification
router.post("/submit", submitVerificationController);

// PATCH update URLs (linkedin, github, portfolio)
router.patch("/update", updateVerificationController);

export default router;
