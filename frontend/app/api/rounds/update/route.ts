import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Round } from '@/lib/models/round.model';
import { Drive } from '@/lib/models/drive.model';

export async function PUT(request: NextRequest) {
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

    const { roundId, roundName, roundNumber } = await request.json();

    if (!roundId || !roundName || !roundNumber) {
      return NextResponse.json(
        { error: 'Round ID, name and number are required' },
        { status: 400 }
      );
    }

    const round = await Round.findOne({ _id: roundId, driveId: drive._id });

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Check if new round number conflicts
    if (roundNumber !== round.roundNumber) {
      const existingRound = await Round.findOne({ driveId: drive._id, roundNumber });
      if (existingRound) {
        return NextResponse.json(
          { error: 'Round number already exists' },
          { status: 400 }
        );
      }
    }

    round.roundName = roundName;
    round.roundNumber = roundNumber;

    await round.save();

    return NextResponse.json({
      message: 'Round updated successfully',
      round
    });

  } catch (error) {
    console.error('Update round error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}