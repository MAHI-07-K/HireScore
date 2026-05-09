import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Round } from '@/lib/models/round.model';
import { Drive } from '@/lib/models/drive.model';

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

    let rounds = await Round.find({ driveId: drive._id }).sort({ roundNumber: 1 });

    // If no rounds exist, create default rounds based on totalRounds
    if (rounds.length === 0 && drive.totalRounds > 0) {
      const defaultRounds = [];
      for (let i = 1; i <= drive.totalRounds; i++) {
        const round = new Round({
          driveId: drive._id,
          roundName: `Round ${i}`,
          roundNumber: i,
          status: i === 1 ? 'active' : 'upcoming' // First round is active by default
        });
        await round.save();
        defaultRounds.push(round);
      }
      rounds = defaultRounds;
    }

    return NextResponse.json({ rounds });

  } catch (error) {
    console.error('Get rounds error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}