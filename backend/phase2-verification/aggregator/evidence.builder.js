import { uniqueNormalized } from "../utils/helpers.js";

export const buildEvidence = ({
  resume,
  githubAnalysis,
  certificateAnalysis,
}) => {
  const claimedSkills = uniqueNormalized(resume?.parsedData?.skills || []);
  const verifiedSkills = uniqueNormalized(githubAnalysis?.matchedSkills || []);
  const missingSkills = claimedSkills.filter((skill) => !verifiedSkills.includes(skill));

  const validCertificates = (certificateAnalysis?.certificates || []).filter(
    (certificate) => certificate.status === "valid"
  ).length;
  const invalidCertificates = (certificateAnalysis?.certificates || []).filter(
    (certificate) => certificate.status === "invalid"
  ).length;
  const unverifiableCertificates = (certificateAnalysis?.certificates || []).filter(
    (certificate) => certificate.status === "unverifiable"
  ).length;

  return {
    skills: {
      claimed: claimedSkills,
      verified: verifiedSkills,
      missing: missingSkills,
    },
    projects: {
      claimed: resume?.parsedData?.projects?.length || 0,
      verified: githubAnalysis?.verifiedProjects?.length || 0,
    },
    certificates: {
      valid: validCertificates,
      invalid: invalidCertificates,
      unverifiable: unverifiableCertificates,
    },
    github: {
      githubVerified: Boolean(githubAnalysis?.githubVerified),
      activityScore: githubAnalysis?.activityScore || 0,
      githubScore: githubAnalysis?.githubScore || 0,
      fakeGithubRisk: githubAnalysis?.fakeGithubRisk || 0,
    },
    metadata: {
      resumeId: String(resume?._id || ""),
      githubUsername: resume?.githubUsername || "",
      checkedAt: new Date(),
    },
  };
};
