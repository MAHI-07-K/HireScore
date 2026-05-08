import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Student = mongoose.model('Student', new mongoose.Schema({
      fullName: { type: String, required: true, trim: true },
      rollNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      password: { type: String, required: true, minlength: 6, select: false },
      college: { type: String, default: '' },
      branch: { type: String, default: '' },
      cgpa: { type: Number, default: 0, min: 0, max: 10 },
      resumeUrl: { type: String, default: null },
      verificationStatus: { type: String, default: 'pending' },
      isEligibleForDrives: { type: Boolean, default: false },
      hireScore: { type: Number, default: 0 }
    }));

    // Test data
    const testData = {
      fullName: 'Test Student',
      rollNumber: '24B11CS000',
      email: 'test@example.com',
      password: '123456',
      college: 'Test College',
      branch: 'CSE',
      cgpa: 8.0
    };

    console.log('Creating student with credentials:');
    console.log('Roll Number:', testData.rollNumber);
    console.log('Password:', testData.password);

    // Hash password
    const hashedPassword = await bcrypt.hash(testData.password, 10);

    // Create student
    const student = await Student.create({
      ...testData,
      password: hashedPassword,
      rollNumber: testData.rollNumber.toUpperCase(),
      email: testData.email.toLowerCase()
    });

    console.log('\n✅ Student created successfully!');
    console.log('Student ID:', student._id);
    console.log('Roll Number:', student.rollNumber);
    console.log('Email:', student.email);

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error('❌ Student already exists (duplicate key error)');
      console.error('Deleting old student and creating new one...');
      
      const Student = mongoose.model('Student');
      await Student.deleteOne({ rollNumber: '24B11CS000' });
      console.log('Old student deleted. Please run this script again.');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
};

createTestStudent();
