import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Student } from "@/lib/models/student.model";
import { Verification } from "@/lib/models/verification.model";
import "@/lib/models/resume.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const skill = searchParams.get("skill") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const matchConditions: any = {};
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

    let filteredStudents: any[] = allStudents;
    if (skill) {
      filteredStudents = allStudents.filter((student: any) => {
        const resume = student.resumeId;
        if (!resume?.parsedData?.skills) return false;
        return resume.parsedData.skills.some((s: string) =>
          s.toLowerCase().includes(skill.toLowerCase())
        );
      });
    }

    const getSortValue = (student: any) => {
      if (sortBy === "confidenceScore")
        return student.confidenceData?.score || 0;
      if (sortBy === "hireScore") return student.hireScore || 0;
      return student[sortBy] || student.createdAt || "";
    };

    filteredStudents.sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (typeof aValue === "string" || typeof bValue === "string") {
        return sortOrder === "desc"
          ? String(bValue).localeCompare(String(aValue), undefined, {
              numeric: true,
              sensitivity: "base",
            })
          : String(aValue).localeCompare(String(bValue), undefined, {
              numeric: true,
              sensitivity: "base",
            });
      }

      return sortOrder === "desc"
        ? (bValue as number) - (aValue as number)
        : (aValue as number) - (bValue as number);
    });

    const pagedStudents = filteredStudents.slice(skip, skip + limit);

    const studentsWithVerification = await Promise.all(
      pagedStudents.map(async (student: any) => {
        const verification: any = await Verification.findOne({
          studentId: student._id,
        }).lean();

        return {
          _id: student._id,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
          email: student.email,
          skills: student.resumeId?.parsedData?.skills || [],
          confidenceScore: student.confidenceData?.score || 0,
          hireScore: verification?.overallScore || student.hireScore || 0,
          verificationStatus:
            verification?.verificationStatus ||
            student.verificationStatus ||
            "Not Started",
          createdAt: student.createdAt,
        };
      })
    );

    const total = filteredStudents.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        students: studentsWithVerification,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Admin get students error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}
