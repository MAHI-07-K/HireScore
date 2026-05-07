/**
 * Confidence Score Service
 * Calculates confidence scores based on verification results
 *
 * Weights:
 * - education: 20%
 * - internships: 25%
 * - projects: 20%
 * - certifications: 15%
 * - skills: 20%
 *
 * Score Mapping:
 * - verified: 100%
 * - partial: 60%
 * - unverified: 20%
 */

const WEIGHTS = {
  education: 0.2,
  internships: 0.25,
  projects: 0.2,
  certifications: 0.15,
  skills: 0.2,
};

const STATUS_SCORES = {
  verified: 100,
  partial: 60,
  unverified: 20,
};

/**
 * Get score multiplier for a status
 */
const getStatusScore = (status = "unverified") => {
  return STATUS_SCORES[status] || STATUS_SCORES.unverified;
};

/**
 * Calculate risk level based on score
 */
const calculateRiskLevel = (score) => {
  if (score >= 80) return "Low Risk";
  if (score >= 60) return "Medium Risk";
  return "High Risk";
};

/**
 * Get confidence score label
 */
const getConfidenceLabel = (score) => {
  if (score >= 81) return "Highly Trustworthy";
  if (score >= 61) return "Strong Verification";
  if (score >= 41) return "Partial Verification";
  if (score >= 21) return "Weak Evidence";
  return "No Supporting Evidence";
};

/**
 * Calculate strengths and concerns
 */
const analyzeVerificationResults = (verificationResults = {}) => {
  const strengths = [];
  const concerns = [];

  // Check education
  if (verificationResults.education?.status === "verified") {
    strengths.push("Educational background verified");
  } else if (verificationResults.education?.status === "unverified") {
    concerns.push("Educational background not verified");
  }

  // Check internships
  if (verificationResults.internships?.status === "verified") {
    strengths.push("Work experience verified");
  } else if (verificationResults.internships?.status === "partial") {
    concerns.push("Some work experience could not be verified");
  } else if (verificationResults.internships?.status === "unverified") {
    concerns.push("Work experience not verified");
  }

  // Check projects
  if (verificationResults.projects?.status === "verified") {
    strengths.push("All projects verified");
  } else if (verificationResults.projects?.status === "partial") {
    concerns.push("Some projects could not be verified");
  } else if (verificationResults.projects?.status === "unverified") {
    concerns.push("No projects verified");
  }

  // Check certifications
  if (verificationResults.certifications?.status === "verified") {
    strengths.push("All certifications verified");
  } else if (verificationResults.certifications?.status === "partial") {
    concerns.push("Some certifications could not be verified");
  } else if (verificationResults.certifications?.status === "unverified") {
    concerns.push("No certifications verified");
  }

  return { strengths, concerns };
};

/**
 * Calculate confidence score from verification results
 * @deprecated Use calculateConfidenceScore instead
 */
export const calculateConfidenceFromVerificationResults = (verificationResults) => {
  const confidenceScore = calculateConfidenceScore(verificationResults);

  const missingVerificationAlerts = Object.entries(verificationResults || {})
    .filter(([, value]) => value.status !== "verified")
    .map(
      ([category, value]) =>
        `${category[0].toUpperCase()}${category.slice(1)}: ${value.explanation}`
    );

  return {
    confidenceScore: confidenceScore.score,
    riskLevel: confidenceScore.riskLevel,
    missingVerificationAlerts,
    eligibility: {
      isEligible: confidenceScore.score >= 70,
      reason:
        confidenceScore.score >= 70
          ? "Student passed the confidence threshold for eligibility."
          : "Student did not meet the required confidence threshold.",
    },
  };
};

/**
 * Calculate confidence score from verification results (NEW)
 */
export const calculateConfidenceScore = (verificationResults = {}) => {
  let totalScore = 0;
  let categoriesCount = 0;

  // Calculate weighted score
  for (const [category, weight] of Object.entries(WEIGHTS)) {
    if (verificationResults[category]) {
      const status = verificationResults[category].status || "unverified";
      const categoryScore = getStatusScore(status);
      totalScore += (categoryScore / 100) * weight * 100;
      categoriesCount++;
    }
  }

  // Normalize score (ensure it's between 0 and 100)
  const finalScore = Math.min(100, Math.max(0, totalScore));

  const riskLevel = calculateRiskLevel(finalScore);
  const label = getConfidenceLabel(finalScore);
  const { strengths, concerns } = analyzeVerificationResults(verificationResults);

  return {
    score: Math.round(finalScore),
    riskLevel,
    label,
    strengths,
    concerns,
    calculatedAt: new Date(),
  };
};

/**
 * Update student confidence data
 */
export const updateStudentConfidenceData = async (student) => {
  try {
    const confidenceData = calculateConfidenceScore(student.verificationResults);
    student.confidenceData = confidenceData;
    student.hireScore = confidenceData.score;

    // Determine eligibility (threshold: 70)
    student.isEligibleForDrives = confidenceData.score >= 70;

    return student;
  } catch (error) {
    console.error("Error calculating confidence data:", error);
    throw error;
  }
};

/**
 * Get breakdown of scores for analytics
 */
export const getScoreBreakdown = (verificationResults = {}) => {
  const breakdown = {};

  for (const [category, weight] of Object.entries(WEIGHTS)) {
    if (verificationResults[category]) {
      const status = verificationResults[category].status || "unverified";
      const statusScore = getStatusScore(status);
      breakdown[category] = Math.round((statusScore / 100) * weight * 100);
    } else {
      breakdown[category] = 0;
    }
  }

  return breakdown;
};
