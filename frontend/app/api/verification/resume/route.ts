import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import { Student } from "@/lib/models/student.model";
import { Resume } from "@/lib/models/resume.model";

const emptyResumeData = {
  _id: null,
  parsedData: {
    skills: [],
    projects: [],
    certifications: [],
  },
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({
        success: true,
        data: emptyResumeData,
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "hirescore-secret-key-2024"
      );
    } catch {
      return NextResponse.json({
        success: true,
        data: emptyResumeData,
      });
    }

    const student = await Student.findById(decoded.studentId);
    if (!student || !student.resumeId) {
      return NextResponse.json({
        success: true,
        data: emptyResumeData,
      });
    }

    const resume = await Resume.findById(student.resumeId);
    if (!resume) {
      return NextResponse.json({
        success: true,
        data: emptyResumeData,
      });
    }

    return NextResponse.json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error("Get resume error:", error);
    return NextResponse.json({
      success: true,
      data: emptyResumeData,
    });
  }
}
