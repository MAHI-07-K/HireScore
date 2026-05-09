import mongoose from "mongoose";

const driveResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
  companyName: { type: String, required: true },
  totalRounds: { type: Number, required: true },
  completedRounds: { type: Number, required: true },
  rejectedRound: { type: Number },
  driveScore: { type: Number, required: true },
  finalStatus: { type: String, enum: ["selected", "rejected"], required: true }
}, {
  timestamps: true
});

// Indexes
driveResultSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

export const DriveResult = mongoose.model("DriveResult", driveResultSchema);