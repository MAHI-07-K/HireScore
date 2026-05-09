import { Router } from "express";
import {
  getAdminAnalytics,
  getAdminStudents,
  getAdminStudentDetail,
} from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

// All admin routes are protected
router.use(protectRoute);

// ─── GET /api/admin/analytics ──────────────────────────────────────────────
router.get("/analytics", getAdminAnalytics);

// ─── GET /api/admin/students ──────────────────────────────────────────────
router.get("/students", getAdminStudents);

// ─── GET /api/admin/students/:studentId ───────────────────────────────────
router.get("/students/:studentId", getAdminStudentDetail);

export default router;