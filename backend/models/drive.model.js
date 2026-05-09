import mongoose from "mongoose";

const driveSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    recruiterId: { type: String, required: true },
    recruiterPassword: { type: String, required: true },
    deadline: { type: Date },
    postedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Drive = mongoose.model("Drive", driveSchema);
