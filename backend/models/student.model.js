import mongoose from "mongoose";

const verificationFieldSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["verified", "partial", "unverified"],
      default: "unverified",
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const confidenceDataSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ["Low Risk", "Medium Risk", "High Risk"],
      default: "High Risk",
    },
    strengths: [String],
    concerns: [String],
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const verificationResultsSchema = new mongoose.Schema(
  {
    education: {
      type: verificationFieldSchema,
      default: () => ({}),
    },
    internships: {
      type: verificationFieldSchema,
      default: () => ({}),
    },
    projects: {
      type: verificationFieldSchema,
      default: () => ({}),
    },
    certifications: {
      type: verificationFieldSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    // Authentication fields - SINGLE ACCOUNT POLICY
    // Each student can only have ONE account per email and ONE per rollNumber
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Don't return password by default
    },

    // Profile fields
    college: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      default: "",
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    // Resume fields
    resumeUrl: {
      type: String,
      default: null,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    // Verification status
    verificationStatus: {
      type: String,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "pending",
    },

    // Confidence data
    confidenceData: {
      type: confidenceDataSchema,
      default: () => ({}),
    },

    // Verification results
    verificationResults: {
      type: verificationResultsSchema,
      default: () => ({}),
    },

    // Eligibility fields
    isEligibleForDrives: {
      type: Boolean,
      default: false,
    },
    hireScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Drive applications
    appliedDrives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drive",
      },
    ],

    // Legacy verification fields (kept for backward compatibility)
    githubUsername: {
      type: String,
      trim: true,
      default: "",
    },
    certificateLinks: [
      {
        type: String,
        trim: true,
      },
    ],
    parsedData: {
      skills: [{ type: String }],
      projects: [{ type: String }],
      certifications: [{ type: String }],
    },
  },
  { timestamps: true }
);

// Index for common queries
studentSchema.index({ email: 1 });
studentSchema.index({ isEligibleForDrives: 1 });

export const Student = mongoose.model("Student", studentSchema);
