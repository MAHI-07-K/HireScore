import { Student } from "../models/student.model.js";
import { Verification } from "../models/verification.model.js";
import { AppError } from "../utils/AppError.js";

const getAverage = (numbers) =>
  numbers.length > 0
    ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length)
    : 0;

// ─── GET /api/admin/analytics ──────────────────────────────────────────────
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();

    const confidenceDocs = await Student.find(
      { "confidenceData.score": { $gt: 0 } },
      { "confidenceData.score": 1 }
    ).lean();

    const verificationDocs = await Verification.find(
      { overallScore: { $gt: 0 } },
      { overallScore: 1 }
    ).lean();

    const confidenceScores = confidenceDocs
      .map((student) => student.confidenceData?.score || 0)
      .filter((score) => score > 0);

    const hireScores = verificationDocs
      .map((verification) => verification.overallScore || 0)
      .filter((score) => score > 0);

    const totalVerifiedStudents = await Verification.countDocuments({
      verificationStatus: { $in: ["Verified", "Partially Verified"] },
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        averageConfidenceScore: getAverage(confidenceScores),
        averageHireScore: getAverage(hireScores),
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