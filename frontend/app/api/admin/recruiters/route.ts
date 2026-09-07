import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Recruiter } from "@/lib/models/recruiter.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { recruiterId: { $regex: search, $options: "i" } },
      ];
    }

    const recruiters = await Recruiter.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Recruiter.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: recruiters,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Admin get recruiters error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch recruiters" },
      { status: 500 }
    );
  }
}
