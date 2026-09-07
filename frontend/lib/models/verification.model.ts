import mongoose from "mongoose";

const uploadedFileSchema = new mongoose.Schema(
  {
    fileName: { type: String },
    url: { type: String },
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String },
    score: { type: Number },
    timestamp: { type: Date, default: Date.now },
    feedback: [{ type: String }],
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    verificationStatus: {
      type: String,
      enum: [
        "Not Started",
        "In Progress",
        "Partially Verified",
        "Verified",
        "Rejected",
      ],
      default: "Not Started",
    },
    educationScore: { type: Number, default: 0 },
    skillsScore: { type: Number, default: 0 },
    certificationScore: { type: Number, default: 0 },
    projectScore: { type: Number, default: 0 },
    identityScore: { type: Number, default: 0 },
    verifiedItems: [{ type: String }],
    rejectedItems: [{ type: String }],
    feedback: [{ type: String }],
    uploadedFiles: [uploadedFileSchema],
    linkedinUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    verificationHistory: [historyEntrySchema],
    lastVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const Verification =
  mongoose.models.Verification ||
  mongoose.model("Verification", verificationSchema);
