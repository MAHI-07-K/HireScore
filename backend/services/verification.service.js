import { Resume } from "../models/resume.model.js";
import { VerificationResult } from "../phase2-verification/models/VerificationResult.js";
import { analyzeGithubEvidence } from "../phase2-verification/github/github.analyzer.js";
import { verifyCertificates } from "../phase2-verification/certificates/certificate.service.js";
import { buildEvidence } from "../phase2-verification/aggregator/evidence.builder.js";
import { scoreWithAi } from "../phase2-verification/ai/ai.scorer.js";
import { calculateConfidenceScore } from "../phase2-verification/scoring/score.calculator.js";
import {
  buildHttpError,
  uniqueNormalized,
} from "../phase2-verification/utils/helpers.js";
import { logger } from "../phase2-verification/utils/logger.js";

const getResumeById = async (resumeId) => {
  const resume = await Resume.findById(resumeId);

  if (!resume) {
    throw buildHttpError("Resume not found", 404);
  }

  return resume;
};

export const runGithubVerification = async ({
  githubUsername,
  skills = [],
  projects = [],
}) => {
  // Prepare project names for text matching and GitHub URLs for direct verification
  const projectsToAnalyze = projects.map((project) =>
    typeof project === "string" ? project : project.name
  );
  
  const projectUrls = projects
    .filter((project) => typeof project === "object" && project.githubUrl)
    .map((project) => project.githubUrl);

  return analyzeGithubEvidence({
    githubUsername,
    claimedSkills: uniqueNormalized(skills),
    claimedProjects: projectsToAnalyze,
    projectUrls,
  });
};

export const runCertificateVerification = async ({
  certifications = [],
  certificateLinks = [],
  candidateName = "",
}) =>
  verifyCertificates({
    extractedCertificates: certifications,
    certificateLinks,
    candidateName,
  });

export const runFullVerification = async ({ resumeId }) => {
  const resume = await getResumeById(resumeId);

  const githubAnalysis = await runGithubVerification({
    githubUsername: resume.githubUsername,
    skills: resume.parsedData?.skills || [],
    projects: resume.parsedData?.projects || [],
  });

  const certificateAnalysis = await runCertificateVerification({
    certifications: resume.parsedData?.certifications || [],
    certificateLinks: resume.certificateLinks || [],
  });

  const evidence = buildEvidence({
    resume,
    githubAnalysis,
    certificateAnalysis,
  });
  const aiAnalysis = await scoreWithAi({
    resume,
    githubAnalysis,
    certificateAnalysis,
    evidence,
  });
  const confidence = calculateConfidenceScore({
    githubAnalysis,
    evidence,
    certificateAnalysis,
    aiAnalysis,
  });

  const verificationResult = await VerificationResult.create({
    resumeId: resume._id,
    githubAnalysis,
    certificateAnalysis,
    evidence,
    aiAnalysis,
    confidenceScore: confidence.confidenceScore,
    label: confidence.label,
    breakdown: confidence.breakdown,
    confidence,
  });

  logger.info("Full verification completed", {
    resumeId: String(resume._id),
    verificationId: String(verificationResult._id),
    confidenceScore: confidence.confidenceScore,
  });

  return {
    verificationId: verificationResult._id,
    resumeId: resume._id,
    githubAnalysis,
    certificateAnalysis,
    evidence,
    aiAnalysis,
    confidence,
  };
};
