import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { Student } from "@/lib/models/student.model";
import { Verification } from "@/lib/models/verification.model";
import "@/lib/models/resume.model";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    await dbConnect();
    const { studentId } = await context.params;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid student ID" },
        { status: 400 }
      );
    }

    const student: any = await Student.findById(studentId).populate("resumeId");
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const verification: any = await Verification.findOne({ studentId }).lean();

    const resume = student.resumeId;
    const resumeData = resume
      ? {
          _id: resume._id,
          skills: resume.parsedData?.skills || [],
          projects: resume.parsedData?.projects || [],
          certifications: resume.parsedData?.certifications || [],
          extractedText: resume.extractedText,
          uploadedAt: resume.createdAt,
        }
      : null;

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
      hireScore: verification?.overallScore || student.hireScore || 0,
      verificationStatus:
        verification?.verificationStatus ||
        student.verificationStatus ||
        "Not Started",
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

    return NextResponse.json({
      success: true,
      data: studentDetail,
    });
  } catch (error: any) {
    console.error("Admin student detail error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch student details" },
      { status: 500 }
    );
  }
}
