import {
  runCertificateVerification,
  runFullVerification,
  runGithubVerification,
} from "../services/verification.service.js";
import { buildHttpError } from "../phase2-verification/utils/helpers.js";

export const verifyGithubController = async (req, res, next) => {
  try {
    const { githubUsername, skills = [], projects = [] } = req.body || {};

    if (!Array.isArray(skills) || !Array.isArray(projects)) {
      throw buildHttpError("skills and projects must be arrays", 400);
    }

    const result = await runGithubVerification({ githubUsername, skills, projects });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificatesController = async (req, res, next) => {
  try {
    const { certifications = [], certificateLinks = [], candidateName = "" } = req.body || {};

    if (!Array.isArray(certifications) || !Array.isArray(certificateLinks)) {
      throw buildHttpError("certifications and certificateLinks must be arrays", 400);
    }

    const result = await runCertificateVerification({
      certifications,
      certificateLinks,
      candidateName,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const verifyFullController = async (req, res, next) => {
  try {
    const { resumeId } = req.body || {};

    if (!resumeId) {
      throw buildHttpError("resumeId is required", 400);
    }

    const result = await runFullVerification({ resumeId });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
