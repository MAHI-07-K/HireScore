import bcrypt from "bcryptjs";
import { Student } from "../models/student.model.js";
import { AppError } from "../utils/AppError.js";
import { generateToken } from "../middleware/auth.middleware.js";

/**
 * Map student response - transforms MongoDB _id to studentId
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
 * Register a new student
 * POST /api/auth/register
 */
export const registerStudentController = async (req, res, next) => {
  try {
    const { fullName, rollNumber, email, password, college, branch, cgpa } = req.body;

    // Validate required fields
    if (!fullName || !rollNumber || !email || !password) {
      throw new AppError("Please provide all required fields", 400);
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ rollNumber: rollNumber.toUpperCase() }, { email: email.toLowerCase() }],
    });

    if (existingStudent) {
      if (existingStudent.rollNumber === rollNumber.toUpperCase()) {
        throw new AppError("This roll number is already registered. Each student can only have one account.", 409);
      } else {
        throw new AppError("This email is already registered. Each student can only have one account.", 409);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await Student.create({
      fullName,
      rollNumber: rollNumber.toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      college,
      branch,
      cgpa,
    });

    // Generate token
    const token = generateToken(student._id);

    // Return response (exclude password)
    const studentResponse = mapStudentResponse(student);

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        student: studentResponse,
        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)?.[0] || "field";
      return next(new AppError(`${field} is already registered. Please use a different ${field}.`, 409));
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message).join(", ");
      return next(new AppError(messages, 400));
    }

    next(error);
  }
};

/**
 * Login student
 * POST /api/auth/login
 */
export const loginStudentController = async (req, res, next) => {
  try {
    const { rollNumber, password } = req.body;

    // Validate required fields
    if (!rollNumber || !password) {
      throw new AppError("Please provide roll number and password", 400);
    }

    // Find student and include password
    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    }).select("+password");

    if (!student) {
      throw new AppError("Invalid roll number or password", 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid roll number or password", 401);
    }

    // Generate token
    const token = generateToken(student._id);

    // Return response with mapped fields
    const studentResponse = mapStudentResponse(student);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        student: studentResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student profile
 * GET /api/auth/profile
 */
export const getStudentProfileController = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.studentId).populate("resumeId appliedDrives");

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    const studentResponse = mapStudentResponse(student);

    res.status(200).json({
      success: true,
      data: studentResponse,
    });
  } catch (error) {
    next(error);
  }
};
