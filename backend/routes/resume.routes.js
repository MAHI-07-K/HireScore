import { Router } from "express";
import { uploadResumeController } from "../controllers/resume.controller.js";
import { uploadResume } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/upload", uploadResume.single("resume"), uploadResumeController);

export default router;
