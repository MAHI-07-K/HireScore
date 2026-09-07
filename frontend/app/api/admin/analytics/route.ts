import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Student } from "@/lib/models/student.model";
import { Verification } from "@/lib/models/verification.model";

const getAverage = (numbers: number[]) =>
  numbers.length > 0
    ? Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length)
    : 0;

export async function GET(_request: NextRequest) {
  try {
    await dbConnect();

    const totalStudents = await Student.countDocuments();

    const students = await Student.find(
      {},
      { confidenceData: 1, hireScore: 1 }
    ).lean();

    const confidenceScores: number[] = students
      .map((student: any) => student.confidenceData?.score || 0)
      .filter((score: number) => score > 0);

    const verifications = await Verification.find(
      {},
      { overallScore: 1, verificationStatus: 1 }
    ).lean();

    const hireScores: number[] = verifications
      .map((v: any) => v.overallScore || 0)
      .filter((score: number) => score > 0);

    const totalVerifiedStudents = await Student.countDocuments({
      $or: [
        { verificationStatus: "completed" },
        { verificationStatus: "Verified" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        averageConfidenceScore: getAverage(confidenceScores),
        highestHireScore: hireScores.length > 0 ? Math.max(...hireScores) : 0,
        totalVerifiedStudents,
      },
    });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
