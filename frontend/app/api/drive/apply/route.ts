import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { DriveApplication } from '@/lib/models/driveApplication.model';
import { Drive } from '@/lib/models/drive.model';
import { Student } from '@/lib/models/student.model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;

    const student = await Student.findById(decoded.studentId);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const { driveId } = await request.json();

    if (!driveId) {
      return NextResponse.json(
        { error: 'Drive ID is required' },
        { status: 400 }
      );
    }

    const drive = await Drive.findById(driveId);

    if (!drive || !drive.isLive || !drive.applicationsOpen) {
      return NextResponse.json(
        { error: 'Drive not available for applications' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await DriveApplication.findOne({
      driveId,
      studentId: student._id
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied to this drive' },
        { status: 400 }
      );
    }

    const application = new DriveApplication({
      driveId,
      studentId: student._id
    });

    await application.save();

    // Add to student's appliedDrives
    student.appliedDrives.push(driveId);
    await student.save();

    return NextResponse.json({
      message: 'Applied successfully',
      application
    });

  } catch (error) {
    console.error('Apply to drive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}