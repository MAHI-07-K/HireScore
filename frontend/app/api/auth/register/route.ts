import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Student } from '@/lib/models/student.model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { fullName, rollNumber, email, password, college, branch, cgpa } = await request.json();

    if (!fullName || !rollNumber || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { rollNumber: rollNumber.toUpperCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingStudent) {
      if (existingStudent.rollNumber === rollNumber.toUpperCase()) {
        return NextResponse.json(
          { success: false, message: 'This roll number is already registered.' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: 'This email is already registered.' },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      fullName,
      rollNumber: rollNumber.toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      college,
      branch,
      cgpa,
    });

    const token = jwt.sign(
      { studentId: String(student._id) },
      process.env.JWT_SECRET || 'hirescore-secret-key-2024',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          studentId: student._id,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
          email: student.email,
          college: student.college,
          branch: student.branch,
          cgpa: student.cgpa,
          verificationStatus: student.verificationStatus,
          confidenceData: student.confidenceData,
          isEligibleForDrives: student.isEligibleForDrives,
          hireScore: student.hireScore,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        },
        token,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Student register error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)?.[0] || 'field';
      return NextResponse.json(
        { success: false, message: `${field} is already registered.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
