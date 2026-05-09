import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { DriveApplication } from '@/lib/models/driveApplication.model';
import { Drive } from '@/lib/models/drive.model';

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

    const drive = await Drive.findOne({ recruiterId: decoded.recruiterId });

    if (!drive) {
      return NextResponse.json(
        { error: 'Drive not found' },
        { status: 404 }
      );
    }

    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const application = await DriveApplication.findOne({
      _id: applicationId,
      driveId: drive._id
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    application.applicationStatus = 'rejected';
    await application.save();

    return NextResponse.json({
      message: 'Candidate rejected successfully',
      application
    });

  } catch (error) {
    console.error('Reject candidate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}