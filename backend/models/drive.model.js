import mongoose from "mongoose";

const driveSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    minCGPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    minConfidenceScore: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    requiredSkills: [String],
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    requiredVerificationStatuses: {
      education: { type: String, default: "verified" },
      projects: { type: String, default: "partial" },
      certifications: { type: String, default: "partial" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for active drives
driveSchema.index({ isActive: 1 });
driveSchema.index({ deadline: 1 });

export const Drive = mongoose.model("Drive", driveSchema);
