import express from "express";
import {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
} from "../controllers/drive.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getDrives);
router.get("/:driveId", getDriveById);
router.post("/", createDrive);
router.put("/:driveId", updateDrive);
router.delete("/:driveId", deleteDrive);

export default router;
