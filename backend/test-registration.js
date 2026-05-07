import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testRegistration = async () => {
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
      cgpa: { type: Number, default: 0, min: 0, max: 10 }
    }));

    // Test data
    const testData = {
      fullName: 'Konda',
      rollNumber: '24B11CS219',
      email: 'kondamahith7@gmail.com',
      password: 'password123', // Test password
      college: 'AUS',
      branch: 'C.S.E',
      cgpa: 8.4
    };

    console.log('Attempting to create student with data:', { ...testData, password: '[HIDDEN]' });

    // Hash password
    const hashedPassword = await bcrypt.hash(testData.password, 10);

    // Create student
    const student = await Student.create({
      ...testData,
      password: hashedPassword,
      rollNumber: testData.rollNumber.toUpperCase(),
      email: testData.email.toLowerCase()
    });

    console.log('Student created successfully:', {
      id: student._id,
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      email: student.email
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
};

testRegistration();