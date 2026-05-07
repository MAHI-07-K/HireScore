import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const showAllStudents = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);

    const db = mongoose.connection.db;
    const studentsCollection = db.collection("students");
    
    const students = await studentsCollection.find({}).toArray();
    
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║          ALL REGISTERED STUDENTS IN DATABASE              ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
    
    if (students.length === 0) {
      console.log("❌ No students found in database\n");
    } else {
      console.log(`✓ Total Students: ${students.length}\n`);
      
      students.forEach((student, index) => {
        console.log(`${index + 1}. Student Record:`);
        console.log(`   ID: ${student._id}`);
        console.log(`   Full Name: ${student.fullName || "N/A"}`);
        console.log(`   Email: ${student.email || "N/A"}`);
        console.log(`   Roll Number: ${student.rollNumber || "N/A"}`);
        console.log(`   College: ${student.college || "N/A"}`);
        console.log(`   Branch: ${student.branch || "N/A"}`);
        console.log(`   CGPA: ${student.cgpa || 0}`);
        console.log(`   Created At: ${student.createdAt}`);
        console.log();
      });
    }

    // Show collection stats
    const stats = await studentsCollection.stats();
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    COLLECTION STATISTICS                   ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");
    console.log(`Database Name: ${db.namespace}`);
    console.log(`Collection: students`);
    console.log(`Total Documents: ${stats.count}`);
    console.log(`Storage Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log();

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

showAllStudents();
