import { Student } from "../models/student.model.js";
import { Verification } from "../models/verification.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";

const getAverage = (numbers) =>
  numbers.length > 0
    ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length)
    : 0;

// ─── GET /api/admin/analytics ──────────────────────────────────────────────
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();

    const students = await Student.find({}, { confidenceData: 1, hireScore: 1 }).lean();

    const confidenceScores = students
      .map((student) => student.confidenceData?.score || 0)
      .filter((score) => score > 0);

    const verifications = await Verification.find({}, { overallScore: 1, verificationStatus: 1 }).lean();

    const hireScores = verifications
      .map((v) => v.overallScore || 0)
      .filter((score) => score > 0);

    const totalVerifiedStudents = await Student.countDocuments({
      verificationStatus: "completed"
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        averageConfidenceScore: getAverage(confidenceScores),
        highestHireScore: hireScores.length > 0 ? Math.max(...hireScores) : 0,
        totalVerifiedStudents,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/students ──────────────────────────────────────────────
export const getAdminStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      skill = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const matchConditions = {};

    if (search) {
      matchConditions.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const allStudents = await Student.find(matchConditions)
      .populate("resumeId")
      .lean();

    let filteredStudents = allStudents;
    if (skill) {
      filteredStudents = allStudents.filter((student) => {
        const resume = student.resumeId;
        if (!resume?.parsedData?.skills) return false;
        return resume.parsedData.skills.some((s) =>
          s.toLowerCase().includes(skill.toLowerCase())
        );
      });
    }

    const getSortValue = (student) => {
      if (sortBy === "confidenceScore") return student.confidenceData?.score || 0;
      if (sortBy === "hireScore") return student.hireScore || 0;
      return student[sortBy] || student.createdAt || "";
    };

    const compareStudents = (a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (typeof aValue === "string" || typeof bValue === "string") {
        return String(aValue).localeCompare(String(bValue), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return aValue - bValue;
    };

    filteredStudents.sort((a, b) =>
      sortOrder === "desc" ? compareStudents(b, a) : compareStudents(a, b)
    );

    const pagedStudents = filteredStudents.slice(skip, skip + limitNum);

    const studentsWithVerification = await Promise.all(
      pagedStudents.map(async (student) => {
        const verification = await Verification.findOne({ studentId: student._id }).lean();

        return {
          _id: student._id,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
          email: student.email,
          skills: student.resumeId?.parsedData?.skills || [],
          confidenceScore: student.confidenceData?.score || 0,
          hireScore: verification?.overallScore || 0,
          verificationStatus: verification?.verificationStatus || "Not Started",
          createdAt: student.createdAt,
        };
      })
    );

    const total = filteredStudents.length;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        students: studentsWithVerification,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalStudents: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/students/:studentId ───────────────────────────────────
export const getAdminStudentDetail = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate("resumeId");
    if (!student) {
      return next(new AppError("Student not found", 404));
    }

    const verification = await Verification.findOne({ studentId }).lean();

    // Get resume data
    const resume = student.resumeId;
    const resumeData = resume ? {
      _id: resume._id,
      skills: resume.parsedData?.skills || [],
      projects: resume.parsedData?.projects || [],
      certifications: resume.parsedData?.certifications || [],
      extractedText: resume.extractedText,
      uploadedAt: resume.createdAt,
    } : null;

    // Get verification history
    const verificationHistory = verification?.verificationHistory || [];

    const studentDetail = {
      _id: student._id,
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      email: student.email,
      college: student.college,
      branch: student.branch,
      cgpa: student.cgpa,
      githubUsername: student.resumeId?.githubUsername || "",
      certificateLinks: student.resumeId?.certificateLinks || [],
      confidenceScore: student.confidenceData?.score || 0,
      hireScore: verification?.overallScore || 0,
      verificationStatus: verification?.verificationStatus || "Not Started",
      feedback: verification?.feedback || [],
      verifiedSkills: verification?.verifiedSkills || [],
      projects: resumeData?.projects || [],
      skills: resumeData?.skills || [],
      certifications: resumeData?.certifications || [],
      resumeLink: resume ? `/api/resume/${resume._id}/download` : null,
      verificationHistory,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    res.json({
      success: true,
      data: studentDetail,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/recruiters ───────────────────────────────────────────
export const getAdminRecruiters = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = {};
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { recruiterId: { $regex: search, $options: "i" } },
      ];
    }

    const recruiters = await Recruiter.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Recruiter.countDocuments(query);

    res.json({
      success: true,
      data: recruiters,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/create-recruiter ─────────────────────────────────────
export const createRecruiter = async (req, res, next) => {
  try {
    const { companyName, recruiterId, password, accountExpiryDate } = req.body;

    if (!companyName || !recruiterId || !password || !accountExpiryDate) {
      return next(new AppError("All fields are required", 400));
    }

    // Check if recruiter already exists
    const existingRecruiter = await Recruiter.findOne({ recruiterId });
    if (existingRecruiter) {
      return next(new AppError("Recruiter ID already exists", 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const recruiter = new Recruiter({
      companyName,
      recruiterId,
      password: hashedPassword,
      accountExpiryDate: new Date(accountExpiryDate)
    });

    await recruiter.save();

    res.status(201).json({
      success: true,
      message: "Recruiter created successfully",
      data: {
        companyName: recruiter.companyName,
        recruiterId: recruiter.recruiterId,
        accountExpiryDate: recruiter.accountExpiryDate
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/recruiters/:recruiterId ────────────────────────────────
export const updateRecruiter = async (req, res, next) => {
  try {
    const { recruiterId } = req.params;
    const { companyName, password, accountExpiryDate } = req.body;

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return next(new AppError("Recruiter not found", 404));
    }

    if (companyName) recruiter.companyName = companyName;
    if (password) recruiter.password = await bcrypt.hash(password, 12);
    if (accountExpiryDate) recruiter.accountExpiryDate = new Date(accountExpiryDate);

    if (req.body.recruiterId && req.body.recruiterId !== recruiter.recruiterId) {
      const existing = await Recruiter.findOne({ recruiterId: req.body.recruiterId });
      if (existing) {
        return next(new AppError("Recruiter ID already exists", 400));
      }
      recruiter.recruiterId = req.body.recruiterId;
    }

    await recruiter.save();

    res.json({
      success: true,
      message: "Recruiter updated successfully",
      data: {
        companyName: recruiter.companyName,
        recruiterId: recruiter.recruiterId,
        accountExpiryDate: recruiter.accountExpiryDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/admin/recruiters/:recruiterId ─────────────────────────────
export const deleteRecruiter = async (req, res, next) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await Recruiter.findByIdAndDelete(recruiterId);
    if (!recruiter) {
      return next(new AppError("Recruiter not found", 404));
    }

    res.json({
      success: true,
      message: "Recruiter deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};