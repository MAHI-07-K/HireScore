import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { Recruiter } from '@/lib/models/recruiter.model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { companyName, recruiterId, password, accountExpiryDate } = await request.json();

    if (!companyName || !recruiterId || !password || !accountExpiryDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if recruiter already exists
    const existingRecruiter = await Recruiter.findOne({ recruiterId });
    if (existingRecruiter) {
      return NextResponse.json(
        { error: 'Recruiter ID already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const recruiter = new Recruiter({
      companyName,
      recruiterId,
      password: hashedPassword,
      accountExpiryDate: new Date(accountExpiryDate)
    });

    await recruiter.save();

    return NextResponse.json({
      message: 'Recruiter created successfully',
      recruiter: {
        companyName: recruiter.companyName,
        recruiterId: recruiter.recruiterId,
        accountExpiryDate: recruiter.accountExpiryDate
      }
    });

  } catch (error) {
    console.error('Create recruiter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}