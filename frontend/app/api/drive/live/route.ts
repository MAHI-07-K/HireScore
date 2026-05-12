import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Drive } from '@/lib/models/drive.model';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const drives = await Drive.find({
      isLive: true,
      applicationsOpen: true
    }).select('companyName role description minCgpa requiredSkills totalRounds');

    return NextResponse.json({ drives });

  } catch (error) {
    console.error('Get live drives error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}