import fs from "fs";
import pdfParse from "pdf-parse";
import { Verification } from "../models/verification.model.js";
import { Resume } from "../models/resume.model.js";
import { runFullVerification } from "../services/verification.service.js";
import { Student } from "../models/student.model.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../phase2-verification/utils/logger.js";
import { ensureValidStudentId } from "../services/student.service.js";
import { parseResumeText } from "../utils/resumeParser.js";

// ─── GET /api/verification/:studentId ──────────────────────────────────────
export const getVerificationController = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    let verification = await Verification.findOne({ studentId });

    // Return a default "Not Started" object if no record yet
    if (!verification) {
      return res.json({
        success: true,
        data: {
          studentId,
          verificationStatus: "Not Started",
          overallScore: 0,
          educationScore: 0,
          skillsScore: 0,
          certificationScore: 0,
          projectScore: 0,
          identityScore: 0,
          verifiedItems: [],
          rejectedItems: [],
          feedback: [],
          uploadedFiles: [],
          linkedinUrl: "",
          githubUrl: "",
          portfolioUrl: "",
          verificationHistory: [],
          lastVerifiedAt: null,
        },
      });
    }

    res.json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/verification/resume ─────────────────────────────────────────
export const getResumeController = async (req, res, next) => {
  try {
    const studentId = ensureValidStudentId(req.user.studentId);

    const student = await Student.findById(studentId);
    if (!student || !student.resumeId) {
      return res.json({
        success: true,
        data: {
          _id: null,
          parsedData: {
            skills: [],
            projects: [],
            certifications: [],
          },
        },
      });
    }

    const resume = await Resume.findById(student.resumeId);
    if (!resume) {
      return res.json({
        success: true,
        data: {
          _id: null,
          parsedData: {
            skills: [],
            projects: [],
            certifications: [],
          },
        },
      });
    }

    res.json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/verification/start ──────────────────────────────────────────
export const startVerificationController = async (req, res, next) => {
  try {
    const studentId = ensureValidStudentId(req.user.studentId);

    let verification = await Verification.findOne({ studentId });
    if (!verification) {
      verification = await Verification.create({
        studentId,
        verificationStatus: "In Progress",
      });
    } else {
      verification.verificationStatus = "In Progress";
      await verification.save();
    }

    res.json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/verification/upload ─────────────────────────────────────────
export const uploadFileController = async (req, res, next) => {
  try {
    const studentId = ensureValidStudentId(req.user.studentId);

    if (!req.file) {
      return next(new AppError("No file uploaded.", 400));
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = String(pdfData.text || "");
    const parsedData = parseResumeText(extractedText);
    const githubUsername = String(req.body.githubUsername || "").trim();
    const certificateLinks = String(req.body.certificateLinks || "")
      .split(/\r?\n/)
      .map((link) => link.trim())
      .filter(Boolean);

    const resumeRecord = await Resume.create({
      extractedText,
      parsedData,
      githubUsername,
      certificateLinks,
      uploadedBy: studentId,
    });

    await Student.findByIdAndUpdate(studentId, {
      resumeId: resumeRecord._id,
      resumeUrl: `/uploads/${req.file.filename}`,
    });

    let verification = await Verification.findOne({ studentId });
    if (!verification) {
      verification = await Verification.create({ studentId, verificationStatus: "In Progress" });
    } else {
      verification.verificationStatus = "In Progress";
      verification.feedback = [];
      verification.lastVerifiedAt = null;
    }

    const fileRecord = {
      fileName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype,
      uploadedAt: new Date(),
    };

    verification.uploadedFiles.push(fileRecord);
    await verification.save();

    res.json({
      success: true,
      message: "Resume uploaded successfully. You can now validate it.",
      data: {
        file: fileRecord,
        resumeId: resumeRecord._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/verification/update ────────────────────────────────────────
export const updateVerificationController = async (req, res, next) => {
  try {
    const studentId = ensureValidStudentId(req.user.studentId);
    const { linkedinUrl, githubUrl, portfolioUrl } = req.body;

    let verification = await Verification.findOne({ studentId });
    if (!verification) {
      verification = await Verification.create({ studentId, verificationStatus: "In Progress" });
    }

    if (linkedinUrl !== undefined) verification.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) verification.githubUrl = githubUrl;
    if (portfolioUrl !== undefined) verification.portfolioUrl = portfolioUrl;
    await verification.save();

    res.json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/verification/submit ─────────────────────────────────────────
export const submitVerificationController = async (req, res, next) => {
  try {
    const studentId = ensureValidStudentId(req.user.studentId);

    // Fetch student to get resumeId
    console.log("[DEBUG] submitVerificationController findById studentId:", studentId, typeof studentId, JSON.stringify(studentId));
    const student = await Student.findById(studentId);
    if (!student) return next(new AppError("Student not found.", 404));
    if (!student.resumeId) {
      return next(new AppError("Please upload your resume first.", 400));
    }

    let verification = await Verification.findOne({ studentId });
    if (!verification) {
      verification = await Verification.create({ studentId, verificationStatus: "In Progress" });
    }

    // Run existing full verification pipeline
    const result = await runFullVerification({ resumeId: student.resumeId });

    // Map pipeline results → our fields
    const overallScore = Math.round(result.confidence?.confidenceScore ?? 0);
    const certScore = Math.round(result.certificateAnalysis?.overallScore ?? 0);
    const githubScore = Math.round(result.githubAnalysis?.overallScore ?? 0);
    const aiScore = Math.round(result.aiAnalysis?.overallScore ?? 0);

    // Derive a simple status from confidence
    let status = "Partially Verified";
    if (overallScore >= 80) status = "Verified";
    else if (overallScore >= 50) status = "Partially Verified";
    else if (overallScore > 0) status = "In Progress";
    else status = "Rejected";

    const feedback = [
      ...(result.aiAnalysis?.concerns ?? []),
      ...(result.aiAnalysis?.suggestions ?? []),
    ];

    verification.overallScore = overallScore;
    verification.certificationScore = certScore;
    verification.projectScore = githubScore;
    verification.skillsScore = aiScore;
    verification.educationScore = Math.round((certScore + aiScore) / 2);
    verification.identityScore = Math.round(overallScore * 0.8);
    verification.verificationStatus = status;
    verification.feedback = feedback;
    verification.lastVerifiedAt = new Date();
    verification.verificationHistory.push({
      status,
      score: overallScore,
      timestamp: new Date(),
      feedback,
    });

    await verification.save();

    // Also update student confidence data for backward compatibility
    await Student.findByIdAndUpdate(studentId, {
      verificationStatus: status === "Verified" ? "completed" : "in-progress",
      "confidenceData.score": overallScore,
      "confidenceData.calculatedAt": new Date(),
    });

    logger.info("Verification submitted", { studentId, overallScore, status });

    res.json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/verification/history/:studentId ──────────────────────────────
export const getHistoryController = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const verification = await Verification.findOne({ studentId });
    if (!verification) return res.json({ success: true, data: [] });
    res.json({ success: true, data: verification.verificationHistory });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/verification/github ─────────────────────────────────────────
export const verifyGithubController = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "GitHub verification endpoint",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/verification/certificates ──────────────────────────────────
export const verifyCertificatesController = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Certificate verification endpoint",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/verification/full ───────────────────────────────────────────
export const verifyFullController = async (req, res, next) => {
  try {
    const result = await runFullVerification(req.body);
    res.status(200).json({
      success: true,
      message: "Full verification completed",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
