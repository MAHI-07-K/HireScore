import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Drive } from '@/lib/models/drive.model';
import { Recruiter } from '@/lib/models/recruiter.model';

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

    const recruiter = await Recruiter.findOne({ recruiterId: decoded.recruiterId });
    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter not found' },
        { status: 404 }
      );
    }

    if (recruiter.hasDriveCreated) {
      return NextResponse.json(
        { error: 'Recruiter has already created a drive' },
        { status: 400 }
      );
    }

    const { role, description, eligibilityCriteria, totalRounds } = await request.json();

    if (!role || !description || !eligibilityCriteria || !totalRounds) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const drive = new Drive({
      recruiterId: recruiter.recruiterId,
      companyName: recruiter.companyName,
      role,
      description,
      eligibilityCriteria,
      totalRounds
    });

    await drive.save();

    // Update recruiter
    recruiter.hasDriveCreated = true;
    await recruiter.save();

    return NextResponse.json({
      message: 'Drive created successfully',
      drive
    });

  } catch (error) {
    console.error('Create drive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}