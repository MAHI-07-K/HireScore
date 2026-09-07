import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  recruiterId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountExpiryDate: { type: Date, required: true },
  hasDriveCreated: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Recruiter = mongoose.models.Recruiter || mongoose.model("Recruiter", recruiterSchema);