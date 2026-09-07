import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
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

    drive.applicationsOpen = false;
    drive.isLive = false;
    drive.driveStatus = 'applications_closed';

    await drive.save();

    return NextResponse.json({
      message: 'Applications closed',
      drive
    });

  } catch (error) {
    console.error('Close applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}