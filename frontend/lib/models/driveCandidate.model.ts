import mongoose from "mongoose";

const driveCandidateSchema = new mongoose.Schema({
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  currentRound: { type: Number, default: 1 },
  completedRounds: { type: Number, default: 0 },
  remainingRounds: { type: Number },
  status: { type: String, enum: ["active", "selected", "rejected", "completed"], default: "active" },
  driveScore: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes
driveCandidateSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

export const DriveCandidate = mongoose.models.DriveCandidate || mongoose.model("DriveCandidate", driveCandidateSchema);