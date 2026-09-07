import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Student } from '@/lib/models/student.model';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided. Please login first.' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'hirescore-secret-key-2024');
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    const student = await Student.findById(decoded.studentId).populate('resumeId appliedDrives');

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        studentId: student._id,
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        email: student.email,
        college: student.college,
        branch: student.branch,
        cgpa: student.cgpa,
        resumeUrl: student.resumeUrl,
        resumeId: student.resumeId,
        verificationStatus: student.verificationStatus,
        confidenceData: student.confidenceData,
        verificationResults: student.verificationResults,
        isEligibleForDrives: student.isEligibleForDrives,
        hireScore: student.hireScore,
        appliedDrives: student.appliedDrives,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
