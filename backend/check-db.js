import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const checkDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log(`Connecting to: ${uri}`);

    await mongoose.connect(uri);
    console.log("✓ MongoDB connected successfully");

    // Get database info
    const db = mongoose.connection.db;
    console.log(`\n📊 Database Name: ${db.name}`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Collections (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log("   ❌ No collections found!");
    } else {
      collections.forEach((col) => console.log(`   ✓ ${col.name}`));
    }

    // Check students collection specifically
    if (collections.some((col) => col.name === "students")) {
      const studentsCollection = db.collection("students");
      const count = await studentsCollection.countDocuments();
      console.log(`\n👥 Students Collection:`);
      console.log(`   Document count: ${count}`);

      if (count > 0) {
        const students = await studentsCollection.find({}).limit(5).toArray();
        console.log(`   Documents (showing ${students.length}):`);
        students.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.fullName} (${student.email})`);
        });
      }
    } else {
      console.log("\n❌ 'students' collection not found!");
      console.log("   This means no students have been registered yet.");
    }

    await mongoose.disconnect();
    console.log("\n✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

checkDatabase();
