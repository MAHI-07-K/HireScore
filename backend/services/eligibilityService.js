import { Drive } from "../models/drive.model.js";

/**
 * Check if a student is eligible for a specific drive
 */
export const checkStudentEligibility = (student, drive) => {
  const eligibleReasons = [];
  const ineligibleReasons = [];

  // Check CGPA requirement
  if (student.cgpa < drive.minCGPA) {
    ineligibleReasons.push(
      `CGPA too low. Required: ${drive.minCGPA}, Your CGPA: ${student.cgpa}`
    );
  } else {
    eligibleReasons.push(`CGPA requirement met (${student.cgpa})`);
  }

  // Check confidence score requirement
  if (student.confidenceData?.score < drive.minConfidenceScore) {
    ineligibleReasons.push(
      `Confidence score too low. Required: ${drive.minConfidenceScore}, Your Score: ${student.confidenceData?.score}`
    );
  } else {
    eligibleReasons.push(
      `Confidence score requirement met (${student.confidenceData?.score})`
    );
  }

  // Check verification status requirements if specified
  if (drive.requiredVerificationStatuses) {
    for (const [category, requiredStatus] of Object.entries(
      drive.requiredVerificationStatuses
    )) {
      const studentStatus = student.verificationResults?.[category]?.status;

      if (!studentStatus) {
        ineligibleReasons.push(`${category} verification status not available`);
      } else if (
        !meetVerificationRequirement(studentStatus, requiredStatus)
      ) {
        ineligibleReasons.push(
          `${category} verification insufficient. Required: ${requiredStatus}, Your Status: ${studentStatus}`
        );
      } else {
        eligibleReasons.push(`${category} verification requirement met`);
      }
    }
  }

  const isEligible = ineligibleReasons.length === 0;

  return {
    isEligible,
    reasons: {
      eligible: eligibleReasons,
      ineligible: ineligibleReasons,
    },
  };
};

/**
 * Check if student verification status meets requirement
 */
const meetVerificationRequirement = (studentStatus, requiredStatus) => {
  // verified meets all requirements
  if (studentStatus === "verified") return true;

  // partial meets partial or unverified requirements
  if (studentStatus === "partial") {
    return requiredStatus === "partial" || requiredStatus === "unverified";
  }

  // unverified only meets unverified requirement
  if (studentStatus === "unverified") {
    return requiredStatus === "unverified";
  }

  return false;
};

/**
 * Get list of drives student is eligible for
 */
export const getEligibleDrivesForStudent = async (student) => {
  try {
    // Get all active drives
    const drives = await Drive.find({
      isActive: true,
      deadline: { $gte: new Date() }, // Only future deadlines
    });

    // Filter based on eligibility
    const eligibleDrives = drives.filter((drive) => {
      const eligibility = checkStudentEligibility(student, drive);
      return eligibility.isEligible;
    });

    return eligibleDrives;
  } catch (error) {
    console.error("Error fetching eligible drives:", error);
    throw error;
  }
};

/**
 * Get list of locked drives (not eligible) for student
 */
export const getLockedDrivesForStudent = async (student) => {
  try {
    // Get all active drives
    const drives = await Drive.find({
      isActive: true,
      deadline: { $gte: new Date() },
    });

    // Filter locked drives with reasons
    const lockedDrives = drives
      .map((drive) => {
        const eligibility = checkStudentEligibility(student, drive);
        if (!eligibility.isEligible) {
          return {
            drive,
            reasons: eligibility.reasons.ineligible,
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    return lockedDrives;
  } catch (error) {
    console.error("Error fetching locked drives:", error);
    throw error;
  }
};

/**
 * Get all drives with eligibility status for student
 */
export const getAllDrivesWithStatus = async (student) => {
  try {
    const eligibleDrives = await getEligibleDrivesForStudent(student);
    const lockedDrives = await getLockedDrivesForStudent(student);

    return {
      eligible: eligibleDrives,
      locked: lockedDrives,
      total: eligibleDrives.length + lockedDrives.length,
    };
  } catch (error) {
    console.error("Error fetching drives with status:", error);
    throw error;
  }
};
