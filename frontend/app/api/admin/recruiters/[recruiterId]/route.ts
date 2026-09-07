import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { Recruiter } from "@/lib/models/recruiter.model";
import { Drive } from "@/lib/models/drive.model";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ recruiterId: string }> }
) {
  try {
    await dbConnect();
    const { recruiterId } = await context.params;
    const body = await request.json();
    const { companyName, password, accountExpiryDate, newRecruiterId } = body;

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return NextResponse.json(
        { success: false, message: "Recruiter not found" },
        { status: 404 }
      );
    }

    if (companyName) recruiter.companyName = companyName;
    if (password) recruiter.password = await bcrypt.hash(password, 12);
    if (accountExpiryDate)
      recruiter.accountExpiryDate = new Date(accountExpiryDate);

    const targetId = newRecruiterId || body.recruiterId;
    if (targetId && targetId !== recruiter.recruiterId) {
      const existing = await Recruiter.findOne({ recruiterId: targetId });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Recruiter ID already exists" },
          { status: 400 }
        );
      }
      recruiter.recruiterId = targetId;
    }

    await recruiter.save();

    return NextResponse.json({
      success: true,
      message: "Recruiter updated successfully",
      data: {
        companyName: recruiter.companyName,
        recruiterId: recruiter.recruiterId,
        accountExpiryDate: recruiter.accountExpiryDate,
      },
    });
  } catch (error: any) {
    console.error("Update recruiter error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update recruiter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ recruiterId: string }> }
) {
  try {
    await dbConnect();
    const { recruiterId } = await context.params;

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return NextResponse.json(
        { success: false, message: "Recruiter not found" },
        { status: 404 }
      );
    }

    // Cascade delete all drives created by this recruiter
    await Drive.deleteMany({
      $or: [
        { recruiterId: recruiter.recruiterId },
        { recruiterId: String(recruiter._id) },
      ],
    });

    await Recruiter.findByIdAndDelete(recruiterId);

    return NextResponse.json({
      success: true,
      message: "Recruiter and associated drives deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete recruiter error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete recruiter" },
      { status: 500 }
    );
  }
}
