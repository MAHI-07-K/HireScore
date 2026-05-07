import { Drive } from "../models/drive.model.js";
import { Student } from "../models/student.model.js";
import { buildHttpError } from "../phase2-verification/utils/helpers.js";

const defaultDrives = [
  {
    company: "Infosys",
    role: "Systems Engineer",
    location: "Hyderabad",
    minConfidenceScore: 55,
  },
  {
    company: "TCS",
    role: "Software Developer",
    location: "Bengaluru",
    minConfidenceScore: 60,
  },
  {
    company: "Accenture",
    role: "Associate Software Engineer",
    location: "Chennai",
    minConfidenceScore: 65,
  },
];

const ensureDefaultDrives = async () => {
  const existingCount = await Drive.countDocuments();
  if (existingCount > 0) return;

  await Drive.insertMany(defaultDrives);
};

const matchesRequiredStatus = (actualStatus, requiredStatus) => {
  const rank = {
    unverified: 0,
    partial: 1,
    verified: 2,
  };

  return (rank[actualStatus] || 0) >= (rank[requiredStatus] || 0);
};

const buildDriveView = (drive, student) => {
  const meetsScore = student.confidenceScore >= drive.minConfidenceScore;
  const meetsProjects = matchesRequiredStatus(
    student.verificationResults.projects.status,
    drive.requiredVerificationStatuses.projects
  );
  const meetsCertifications = matchesRequiredStatus(
    student.verificationResults.certifications.status,
    drive.requiredVerificationStatuses.certifications
  );
  const isEligible =
    student.verificationCompleted &&
    student.eligibility.isEligible &&
    meetsScore &&
    meetsProjects &&
    meetsCertifications;

  return {
    id: String(drive._id),
    company: drive.company,
    role: drive.role,
    location: drive.location,
    minConfidenceScore: drive.minConfidenceScore,
    isEligible,
    alreadyApplied: student.appliedDrives.some(
      (driveId) => String(driveId) === String(drive._id)
    ),
  };
};

export const listAvailableDrivesForStudent = async (studentId) => {
  await ensureDefaultDrives();

  const student = await Student.findById(studentId);
  if (!student) {
    throw buildHttpError("Student not found", 404);
  }

  const drives = await Drive.find({ isActive: true }).sort({ createdAt: -1 });
  return drives.map((drive) => buildDriveView(drive, student));
};

export const applyForDrive = async ({ studentId, driveId }) => {
  await ensureDefaultDrives();

  const [student, drive] = await Promise.all([
    Student.findById(studentId),
    Drive.findById(driveId),
  ]);

  if (!student) {
    throw buildHttpError("Student not found", 404);
  }

  if (!drive || !drive.isActive) {
    throw buildHttpError("Drive not found", 404);
  }

  const driveView = buildDriveView(drive, student);

  if (!student.verificationCompleted) {
    throw buildHttpError(
      "Complete resume verification before applying for drives.",
      400
    );
  }

  if (!driveView.isEligible) {
    throw buildHttpError(
      "Student is not eligible to apply for this drive yet.",
      403
    );
  }

  if (driveView.alreadyApplied) {
    throw buildHttpError("Student has already applied for this drive.", 409);
  }

  student.appliedDrives.push(drive._id);
  await student.save();

  return {
    applied: true,
    drive: {
      id: String(drive._id),
      company: drive.company,
      role: drive.role,
      location: drive.location,
    },
  };
};
