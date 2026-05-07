import { Router } from "express";
import {
  verifyCertificatesController,
  verifyFullController,
  verifyGithubController,
} from "../../controllers/verification.controller.js";

const router = Router();

router.post("/github", verifyGithubController);
router.post("/certificates", verifyCertificatesController);
router.post("/full", verifyFullController);

export default router;
