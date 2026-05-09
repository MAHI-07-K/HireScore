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

    const { roundId } = await request.json();

    if (!roundId) {
      return NextResponse.json(
        { error: 'Round ID is required' },
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

    round.status = 'completed';
    await round.save();

    // Check if there are more rounds
    const nextRound = await Round.findOne({
      driveId: drive._id,
      roundNumber: round.roundNumber + 1
    });

    if (nextRound) {
      nextRound.status = 'active';
      await nextRound.save();
    } else {
      // No more rounds, mark drive as completed
      drive.driveStatus = 'completed';
      await drive.save();
    }

    return NextResponse.json({
      message: 'Round completed successfully',
      round
    });

  } catch (error) {
    console.error('Complete round error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}