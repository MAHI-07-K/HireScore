import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
  roundName: { type: String, required: true },
  roundNumber: { type: Number, required: true },
  status: { type: String, enum: ["upcoming", "active", "completed"], default: "upcoming" }
}, {
  timestamps: true
});

// Indexes
roundSchema.index({ driveId: 1, roundNumber: 1 });

export const Round = mongoose.models.Round || mongoose.model("Round", roundSchema);