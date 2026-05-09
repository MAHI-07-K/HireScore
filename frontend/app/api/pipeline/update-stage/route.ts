import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { DriveCandidate } from '@/lib/models/driveCandidate.model';
import { DriveResult } from '@/lib/models/driveResult.model';
import { Drive } from '@/lib/models/drive.model';
import { Student } from '@/lib/models/student.model';

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

    const { candidateId, result } = await request.json(); // result: 'selected' or 'rejected'

    if (!candidateId || !result) {
      return NextResponse.json(
        { error: 'Candidate ID and result are required' },
        { status: 400 }
      );
    }

    const candidate = await DriveCandidate.findOne({
      _id: candidateId,
      driveId: drive._id
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    if (result === 'selected') {
      candidate.completedRounds += 1;
      candidate.remainingRounds -= 1;
      candidate.currentRound += 1;

      if (candidate.currentRound > drive.totalRounds) {
        // Final selection
        candidate.status = 'selected';
        candidate.driveScore = 100;
      }
    } else if (result === 'rejected') {
      candidate.status = 'rejected';
      candidate.driveScore = (candidate.completedRounds / drive.totalRounds) * 100;
    }

    await candidate.save();

    // If final round or rejected, create DriveResult
    if (candidate.status === 'selected' || candidate.status === 'rejected') {
      const driveResult = new DriveResult({
        studentId: candidate.studentId,
        driveId: drive._id,
        companyName: drive.companyName,
        totalRounds: drive.totalRounds,
        completedRounds: candidate.completedRounds,
        rejectedRound: result === 'rejected' ? candidate.currentRound : null,
        driveScore: candidate.driveScore,
        finalStatus: candidate.status
      });

      await driveResult.save();

      // Update student's HireScore
      const student = await Student.findById(candidate.studentId);
      if (student) {
        // Get all drive results for the student
        const allResults = await DriveResult.find({ studentId: candidate.studentId });
        const totalScore = allResults.reduce((sum, result) => sum + result.driveScore, 0);
        student.hireScore = totalScore / allResults.length;
        await student.save();
      }
    }

    return NextResponse.json({
      message: 'Candidate updated successfully',
      candidate
    });

  } catch (error) {
    console.error('Update candidate stage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}