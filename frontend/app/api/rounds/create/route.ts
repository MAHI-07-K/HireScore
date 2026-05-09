import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Round } from '@/lib/models/round.model';
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

    const { roundName, roundNumber } = await request.json();

    if (!roundName || !roundNumber) {
      return NextResponse.json(
        { error: 'Round name and number are required' },
        { status: 400 }
      );
    }

    // Check if round number already exists
    const existingRound = await Round.findOne({ driveId: drive._id, roundNumber });
    if (existingRound) {
      return NextResponse.json(
        { error: 'Round number already exists' },
        { status: 400 }
      );
    }

    const round = new Round({
      driveId: drive._id,
      roundName,
      roundNumber
    });

    await round.save();

    return NextResponse.json({
      message: 'Round created successfully',
      round
    });

  } catch (error) {
    console.error('Create round error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}