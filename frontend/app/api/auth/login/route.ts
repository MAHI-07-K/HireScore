import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Student } from '@/lib/models/student.model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { rollNumber, password } = await request.json();

    if (!rollNumber || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide roll number and password' },
        { status: 400 }
      );
    }

    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    }).select('+password');

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Invalid roll number or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid roll number or password' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { studentId: String(student._id) },
      process.env.JWT_SECRET || 'hirescore-secret-key-2024',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        student: {
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
        token,
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
