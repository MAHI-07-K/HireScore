import { Router } from "express";
import {
  registerStudentController,
  loginStudentController,
  getStudentProfileController,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", registerStudentController);
router.post("/login", loginStudentController);

// Protected routes
router.get("/profile", protectRoute, getStudentProfileController);

export default router;
