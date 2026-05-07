import { Router } from "express";
import {
  uploadResumeController,
  verifyResumeController,
  getStudentController,
  getStudentDashboardController,
  getEligibleDrivesController,
  getLockedDrivesController,
  listStudentDrivesController,
  applyStudentDriveController,
  // Legacy
  submitStudentResumeController,
  verifyStudentResumeController,
} from "../controllers/student.controller.js";
import { uploadResume } from "../middleware/upload.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

// Protected routes
router.get("/:studentId", protectRoute, getStudentController);
router.get("/:studentId/dashboard", protectRoute, getStudentDashboardController);

// Resume upload and verification
router.post(
  "/:studentId/upload-resume",
  protectRoute,
  uploadResume.single("resume"),
  uploadResumeController
);
router.post("/:studentId/verify-resume", protectRoute, verifyResumeController);

// Drives endpoints
router.get("/:studentId/drives", protectRoute, listStudentDrivesController);
router.get("/:studentId/drives/eligible", protectRoute, getEligibleDrivesController);
router.get("/:studentId/drives/locked", protectRoute, getLockedDrivesController);
router.post("/:studentId/drives/:driveId/apply", protectRoute, applyStudentDriveController);

// Legacy endpoints (kept for backward compatibility)
router.post("/submit", uploadResume.single("resume"), submitStudentResumeController);
router.post("/:studentId/verify", verifyStudentResumeController);

export default router;
