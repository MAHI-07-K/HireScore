import {
  getStudentById,
  submitStudentResume,
  verifyStudentResume,
  applyForDrive,
  listAvailableDrivesForStudent,
  getStudentDashboard,
  getEligibleDrives,
  getLockedDrives,
} from "../services/student.service.js";

/**
 * Upload resume
 * POST /api/students/:studentId/upload-resume
 */
export const uploadResumeController = async (req, res, next) => {
  try {
    const result = await submitStudentResume({
      file: req.file,
      body: req.body,
      studentId: req.params.studentId,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify resume
 * POST /api/students/:studentId/verify-resume
 */
export const verifyResumeController = async (req, res, next) => {
  try {
    const result = await verifyStudentResume(req.params.studentId);

    res.status(200).json({
      success: true,
      message: "Resume verification initiated",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student profile
 * GET /api/students/:studentId
 */
export const getStudentController = async (req, res, next) => {
  try {
    const result = await getStudentById(req.params.studentId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student dashboard
 * GET /api/students/:studentId/dashboard
 */
export const getStudentDashboardController = async (req, res, next) => {
  try {
    const result = await getStudentDashboard(req.params.studentId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get eligible drives
 * GET /api/students/:studentId/drives/eligible
 */
export const getEligibleDrivesController = async (req, res, next) => {
  try {
    const drives = await getEligibleDrives(req.params.studentId);

    res.status(200).json({
      success: true,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get locked drives
 * GET /api/students/:studentId/drives/locked
 */
export const getLockedDrivesController = async (req, res, next) => {
  try {
    const drives = await getLockedDrives(req.params.studentId);

    res.status(200).json({
      success: true,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all drives with status
 * GET /api/students/:studentId/drives
 */
export const listStudentDrivesController = async (req, res, next) => {
  try {
    const drives = await listAvailableDrivesForStudent(req.params.studentId);

    res.status(200).json({
      success: true,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Apply for drive
 * POST /api/students/:studentId/drives/:driveId/apply
 */
export const applyStudentDriveController = async (req, res, next) => {
  try {
    const result = await applyForDrive({
      studentId: req.params.studentId,
      driveId: req.params.driveId,
    });

    res.status(200).json({
      success: true,
      message: "Successfully applied for drive",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Legacy controller exports (kept for backward compatibility)
export const submitStudentResumeController = uploadResumeController;
export const verifyStudentResumeController = verifyResumeController;
