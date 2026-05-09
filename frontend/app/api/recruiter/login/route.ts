import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { Recruiter } from '@/lib/models/recruiter.model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { recruiterId, password } = await request.json();

    if (!recruiterId || !password) {
      return NextResponse.json(
        { error: 'Recruiter ID and password are required' },
        { status: 400 }
      );
    }

    const recruiter = await Recruiter.findOne({ recruiterId });

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check account expiry
    if (new Date() > new Date(recruiter.accountExpiryDate)) {
      return NextResponse.json(
        { error: 'Account Expired. Contact Admin.' },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, recruiter.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { recruiterId: recruiter.recruiterId, companyName: recruiter.companyName },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      recruiter: {
        recruiterId: recruiter.recruiterId,
        companyName: recruiter.companyName,
        hasDriveCreated: recruiter.hasDriveCreated
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}