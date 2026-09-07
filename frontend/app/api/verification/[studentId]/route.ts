import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { Verification } from "@/lib/models/verification.model";

const defaultVerificationData = (studentId: string) => ({
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
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    await dbConnect();
    const { studentId } = await context.params;

    if (
      !studentId ||
      studentId === "undefined" ||
      studentId === "null" ||
      studentId === ""
    ) {
      return NextResponse.json({
        success: true,
        data: defaultVerificationData(studentId || ""),
      });
    }

    // Check if it's a valid ObjectId
    const isValidId = mongoose.Types.ObjectId.isValid(studentId);
    let verification = null;

    if (isValidId) {
      verification = await Verification.findOne({ studentId });
    }

    if (!verification) {
      return NextResponse.json({
        success: true,
        data: defaultVerificationData(studentId),
      });
    }

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error: any) {
    console.error("Get verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch verification" },
      { status: 500 }
    );
  }
}
