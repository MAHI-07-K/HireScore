import mongoose from "mongoose";

const driveSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    applicationUrl: { type: String },
    eligibilityCriteria: { type: String },
    postedDate: { type: Date, default: Date.now },
    deadline: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Drive = mongoose.model("Drive", driveSchema);
