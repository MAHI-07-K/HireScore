import mongoose from "mongoose";

const driveSchema = new mongoose.Schema({
  recruiterId: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: function() { return this.driveStatus !== 'draft'; } },
  description: { type: String, required: function() { return this.driveStatus !== 'draft'; } },
  minCgpa: { type: Number, required: function() { return this.driveStatus !== 'draft'; } },
  requiredSkills: { type: [String], required: function() { return this.driveStatus !== 'draft'; } },
  totalRounds: { type: Number, required: function() { return this.driveStatus !== 'draft'; } },
  driveStatus: { type: String, enum: ["draft", "live", "applications_closed", "active", "completed"], default: "draft" },
  isLive: { type: Boolean, default: false },
  applicationsOpen: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes
driveSchema.index({ recruiterId: 1 });

export const Drive = mongoose.model("Drive", driveSchema);
