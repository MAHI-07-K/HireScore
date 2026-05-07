import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Student = mongoose.model('Student', new mongoose.Schema({
      rollNumber: String,
      email: String
    }));

    const existingStudent = await Student.findOne({
      $or: [
        { rollNumber: '24B11CS219' },
        { email: 'kondamahith7@gmail.com' }
      ]
    });

    if (existingStudent) {
      console.log('Existing student found:', {
        rollNumber: existingStudent.rollNumber,
        email: existingStudent.email
      });
    } else {
      console.log('No existing student found with that roll number or email');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkStudent();