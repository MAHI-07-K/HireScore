import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { DriveCandidate } from '@/lib/models/driveCandidate.model';
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

    const candidates = await DriveCandidate.find({ driveId: drive._id })
      .populate({
        path: 'studentId',
        select: 'fullName email skills hireScore confidenceScore resumeUrl',
        model: Student
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ candidates });

  } catch (error) {
    console.error('Get pipeline candidates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}