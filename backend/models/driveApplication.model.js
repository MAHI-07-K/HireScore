import mongoose from "mongoose";

const driveApplicationSchema = new mongoose.Schema({
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  appliedAt: { type: Date, default: Date.now },
  applicationStatus: { type: String, enum: ["applied", "shortlisted", "rejected", "selected"], default: "applied" }
}, {
  timestamps: true
});

// Indexes
driveApplicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

export const DriveApplication = mongoose.model("DriveApplication", driveApplicationSchema);