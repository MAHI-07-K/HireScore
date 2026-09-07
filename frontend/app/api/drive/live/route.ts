import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Drive } from '@/lib/models/drive.model';
import { Recruiter } from '@/lib/models/recruiter.model';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const drives = await Drive.find({
      isLive: true,
      applicationsOpen: true
    }).select('companyName role description minCgpa requiredSkills totalRounds recruiterId');

    const validDrives = [];
    for (const drive of drives) {
      if (drive.recruiterId) {
        const recruiterExists = await Recruiter.exists({ recruiterId: drive.recruiterId });
        if (!recruiterExists) {
          // Recruiter was deleted - clean up orphaned drive
          await Drive.deleteOne({ _id: drive._id });
          continue;
        }
      }
      validDrives.push(drive);
    }

    return NextResponse.json({ drives: validDrives });

  } catch (error) {
    console.error('Get live drives error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}