import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { DriveApplication } from '@/lib/models/driveApplication.model';
import { Drive } from '@/lib/models/drive.model';
import { Student } from '@/lib/models/student.model';

export async function GET(request: NextRequest) {
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

    const drive = await Drive.findOne({ recruiterId: decoded.recruiterId });

    if (!drive) {
      return NextResponse.json(
        { error: 'Drive not found' },
        { status: 404 }
      );
    }

    const applications = await DriveApplication.find({ driveId: drive._id })
      .populate('studentId', 'fullName email skills hireScore confidenceScore resumeUrl')
      .sort({ appliedAt: -1 });

    return NextResponse.json({ applications });

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}