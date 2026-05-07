import { clampScore } from "../utils/helpers.js";

const labelFromScore = (score) => {
  if (score <= 20) return "No Supporting Evidence";
  if (score <= 40) return "Weak Evidence";
  if (score <= 60) return "Partial Verification";
  if (score <= 80) return "Strong Verification";
  return "Highly Trustworthy";
};

export const calculateConfidenceScore = ({
  githubAnalysis,
  evidence,
  certificateAnalysis,
  aiAnalysis,
}) => {
  const projectRatio = evidence.projects.claimed
    ? evidence.projects.verified / evidence.projects.claimed
    : 0;
  const certificateRatio =
    certificateAnalysis.certificates.length > 0
      ? (
          certificateAnalysis.certificates.filter((item) => item.status === "valid").length +
          certificateAnalysis.certificates.filter(
            (item) => item.status === "unverifiable"
          ).length *
            0.2
        ) / certificateAnalysis.certificates.length
      : 0;

  const activityRatio = (githubAnalysis?.activityScore || 0) / 100;

  const penalties = Math.min(
    25,
    evidence.certificates.invalid * 8 +
      Math.round((githubAnalysis?.fakeGithubRisk || 0) * 0.12) +
      Math.min((aiAnalysis?.suspiciousClaims?.length || 0) * 2, 8)
  );

  const skillsComponent = 0;
  const projectsComponent = projectRatio * 70;
  const certificatesComponent = certificateRatio * 20;
  const activityComponent = activityRatio * 10;

  const aiAdjustment =
    aiAnalysis.verdict === "supported"
      ? 4
      : aiAnalysis.verdict === "weakly_supported"
        ? 2
        : aiAnalysis.verdict === "unsupported"
          ? -4
          : 0;

  const confidenceScore = clampScore(
    skillsComponent +
      projectsComponent +
      certificatesComponent +
      activityComponent +
      aiAdjustment -
      penalties
  );

  return {
    confidenceScore,
    label: labelFromScore(confidenceScore),
    breakdown: {
    skills: clampScore(skillsComponent),
      projects: clampScore(projectsComponent),
      certificates: clampScore(certificatesComponent),
      activity: clampScore(activityComponent),
      penalties: clampScore(penalties),
    },
  };
};
