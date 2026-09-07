import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String },
  branch: { type: String },
  cgpa: { type: Number },
  resumeUrl: { type: String },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  skills: [{ type: String }],
  verificationStatus: {
    type: String,
    enum: ["pending", "in-progress", "completed", "failed"],
    default: "pending"
  },
  confidenceScore: { type: Number, default: 0 },
  confidenceData: {
    score: { type: Number, default: 0 },
    riskLevel: { type: String, default: "High Risk" }
  },
  verificationResults: {
    projects: {
      status: { type: String, enum: ["verified", "partial", "unverified"], default: "unverified" },
      explanation: { type: String }
    },
    certifications: {
      status: { type: String, enum: ["verified", "partial", "unverified"], default: "unverified" },
      explanation: { type: String }
    }
  },
  isEligibleForDrives: { type: Boolean, default: false },
  hireScore: { type: Number, default: 0 },
  appliedDrives: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drive" }]
}, {
  timestamps: true
});

export const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);