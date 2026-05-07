import { Student } from "../models/student.model.js";
import { Resume } from "../models/resume.model.js";
import { Drive } from "../models/drive.model.js";
import { createResumeFromUpload } from "./resume.service.js";
import { callExistingVerificationModule, normalizeVerificationResponse } from "./verificationService.js";
import { calculateConfidenceScore, updateStudentConfidenceData } from "./confidenceService.js";
import {
  getEligibleDrivesForStudent,
  getLockedDrivesForStudent,
  getAllDrivesWithStatus,
  checkStudentEligibility,
} from "./eligibilityService.js";
import { AppError } from "../utils/AppError.js";

/**
 * Map student response for API
 */
const mapStudentResponse = (student) => ({
  studentId: student._id,
  fullName: student.fullName,
  rollNumber: student.rollNumber,
  email: student.email,
  college: student.college,
  branch: student.branch,
  cgpa: student.cgpa,
  resumeUrl: student.resumeUrl,
  resumeId: student.resumeId,
  verificationStatus: student.verificationStatus,
  confidenceData: student.confidenceData,
  verificationResults: student.verificationResults,
  isEligibleForDrives: student.isEligibleForDrives,
  hireScore: student.hireScore,
  appliedDrives: student.appliedDrives,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

/**
 * Submit resume and create student record
 */
export const submitStudentResume = async ({ file, body, studentId }) => {
  try {
    if (!file) {
      throw new AppError("Resume file is required", 400);
    }

    // Create resume record
    const resume = await createResumeFromUpload({ file, body });

    // Update or create student record
    let student;

    if (studentId) {
      // Update existing student's resume
      student = await Student.findById(studentId);
      if (!student) {
        throw new AppError("Student not found", 404);
      }
      student.resumeUrl = file.path;
      student.resumeId = resume._id;
      student.verificationStatus = "pending";
    } else {
      // Create new student (legacy flow - should use auth/register instead)
      student = await Student.create({
        fullName: body.fullName || "Unknown",
        rollNumber: body.rollNumber || `UNKNOWN-${Date.now()}`,
        email: body.email || `student${Date.now()}@example.com`,
        password: "placeholder", // Should not happen - use auth endpoint
        resumeUrl: file.path,
        resumeId: resume._id,
        verificationStatus: "pending",
      });
    }

    await student.save();
    return mapStudentResponse(student);
  } catch (error) {
    throw error;
  }
};

/**
 * Verify student resume using existing verification module
 */
export const verifyStudentResume = async (studentId) => {
  try {
    const student = await Student.findById(studentId).populate("resumeId");

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    if (!student.resumeId) {
      throw new AppError("Student resume not found. Upload a resume first.", 404);
    }

    // Update status to in-progress
    student.verificationStatus = "in-progress";
    await student.save();

    const resume = student.resumeId;

    // Call existing verification module
    const verificationResponse = await callExistingVerificationModule({ resume });
    const normalizedResults = normalizeVerificationResponse(verificationResponse);

    // Update student with verification results
    student.verificationResults = normalizedResults;
    student.verificationStatus = "completed";

    // Calculate confidence score and update eligibility
    await updateStudentConfidenceData(student);

    await student.save();

    return mapStudentResponse(student);
  } catch (error) {
    const student = await Student.findById(studentId);
    if (student) {
      student.verificationStatus = "failed";
      await student.save();
    }
    throw error;
  }
};

/**
 * Get student profile
 */
export const getStudentById = async (studentId) => {
  try {
    const student = await Student.findById(studentId)
      .populate("resumeId")
      .populate("appliedDrives");

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    return mapStudentResponse(student);
  } catch (error) {
    throw error;
  }
};

/**
 * List available drives for student
 */
export const listAvailableDrivesForStudent = async (studentId) => {
  try {
    const student = await Student.findById(studentId);

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    const drivesWithStatus = await getAllDrivesWithStatus(student);

    return {
      eligibleDrives: drivesWithStatus.eligible,
      lockedDrives: drivesWithStatus.locked.map((item) => ({
        drive: item.drive,
        lockReasons: item.reasons,
      })),
      totalDrives: drivesWithStatus.total,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get eligible drives for student
 */
export const getEligibleDrives = async (studentId) => {
  try {
    const student = await Student.findById(studentId);

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    const eligibleDrives = await getEligibleDrivesForStudent(student);
    return eligibleDrives;
  } catch (error) {
    throw error;
  }
};

/**
 * Get locked drives for student
 */
export const getLockedDrives = async (studentId) => {
  try {
    const student = await Student.findById(studentId);

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    const lockedDrives = await getLockedDrivesForStudent(student);
    return lockedDrives;
  } catch (error) {
    throw error;
  }
};

/**
 * Apply for a drive
 */
export const applyForDrive = async ({ studentId, driveId }) => {
  try {
    const student = await Student.findById(studentId);
    const drive = await Drive.findById(driveId);

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    if (!drive) {
      throw new AppError("Drive not found", 404);
    }

    // Check eligibility
    const eligibility = checkStudentEligibility(student, drive);

    if (!eligibility.isEligible) {
      throw new AppError(
        `Cannot apply: ${eligibility.reasons.ineligible.join("; ")}`,
        403
      );
    }

    // Check if already applied
    if (student.appliedDrives.includes(driveId)) {
      throw new AppError("Already applied for this drive", 400);
    }

    // Add drive to applied list
    student.appliedDrives.push(driveId);
    await student.save();

    return {
      message: "Applied successfully",
      drive,
      student: mapStudentResponse(student),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get student dashboard data
 */
export const getStudentDashboard = async (studentId) => {
  try {
    const student = await Student.findById(studentId)
      .populate("resumeId")
      .populate("appliedDrives");

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    const drivesWithStatus = await getAllDrivesWithStatus(student);

    return {
      profile: mapStudentResponse(student),
      verificationStatus: student.verificationStatus,
      confidenceScore: student.confidenceData?.score || 0,
      riskLevel: student.confidenceData?.riskLevel || "High Risk",
      eligibilityStatus: {
        isEligible: student.isEligibleForDrives,
        minScoreRequired: 70,
        currentScore: student.confidenceData?.score || 0,
      },
      availableDrives: drivesWithStatus.eligible,
      lockedDrives: drivesWithStatus.locked,
      appliedDrives: student.appliedDrives,
    };
  } catch (error) {
    throw error;
  }
};
