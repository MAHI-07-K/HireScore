import axios from "axios";
import { buildHttpError } from "../phase2-verification/utils/helpers.js";

const DEFAULT_EXPLANATION =
  "Existing verification module did not return this verification category.";

const buildStatus = (status = "unverified", explanation = DEFAULT_EXPLANATION) => ({
  status,
  explanation,
});

const normalizeStructuredResponse = (verificationResults = {}) => ({
  projects: buildStatus(
    verificationResults.projects?.status,
    verificationResults.projects?.explanation
  ),
  certifications: buildStatus(
    verificationResults.certifications?.status,
    verificationResults.certifications?.explanation
  ),
});

const summarizeLegacyProjects = (legacyResponse) => {
  const verifiedProjects = legacyResponse.githubAnalysis?.verifiedProjects?.length || 0;
  const claimedProjects = legacyResponse.evidence?.projects?.claimed || 0;

  if (verifiedProjects > 0) {
    return buildStatus(
      verifiedProjects === claimedProjects ? "verified" : "partial",
      `${verifiedProjects} project${verifiedProjects === 1 ? "" : "s"} matched repository evidence.`
    );
  }

  return buildStatus("unverified", "No GitHub repository evidence was matched to resume projects.");
};

const summarizeLegacyCertificates = (legacyResponse) => {
  const certificateStatuses =
    legacyResponse.certificateAnalysis?.certificates?.map((item) => item.status) || [];

  if (certificateStatuses.includes("valid")) {
    return buildStatus(
      certificateStatuses.every((status) => status === "valid") ? "verified" : "partial",
      "Certificate validation returned at least one verified certificate."
    );
  }

  if (certificateStatuses.includes("unverifiable")) {
    return buildStatus(
      "partial",
      "Certificate records were found, but the existing verification module could not fully validate them."
    );
  }

  return buildStatus("unverified", "No certificate validation evidence was returned.");
};

const normalizeLegacyVerificationResponse = (legacyResponse = {}) => ({
  projects: summarizeLegacyProjects(legacyResponse),
  certifications: summarizeLegacyCertificates(legacyResponse),
});

const buildVerificationModuleUrl = () => {
  if (process.env.EXISTING_VERIFICATION_MODULE_URL) {
    return process.env.EXISTING_VERIFICATION_MODULE_URL;
  }

  const port = process.env.PORT || 5000;
  return `http://127.0.0.1:${port}/api/phase2-verification/full`;
};

export const callExistingVerificationModule = async ({ resume }) => {
  const url = buildVerificationModuleUrl();

  try {
    const response = await axios.post(
      url,
      {
        resumeId: String(resume._id),
        extractedText: resume.extractedText,
        parsedData: resume.parsedData,
        githubUsername: resume.githubUsername,
        certificateLinks: resume.certificateLinks,
      },
      {
        timeout: 30000,
      }
    );

    return response.data?.data || response.data;
  } catch (error) {
    throw buildHttpError(
      error.response?.data?.message ||
        "Existing verification module could not be reached.",
      error.response?.status || 502
    );
  }
};

export const normalizeVerificationResponse = (payload = {}) => {
  if (payload.verificationResults) {
    return normalizeStructuredResponse(payload.verificationResults);
  }

  if (payload.githubAnalysis || payload.certificateAnalysis) {
    return normalizeLegacyVerificationResponse(payload);
  }

  throw buildHttpError("Verification module returned an unsupported response.", 502);
};

export const getVerificationResults = async ({ resume }) => {
  const rawResponse = await callExistingVerificationModule({ resume });
  const verificationResults = normalizeVerificationResponse(rawResponse);

  return {
    verificationResults,
    rawVerificationResponse: rawResponse,
  };
};
