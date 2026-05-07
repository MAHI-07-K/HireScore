import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
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
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    parsedData: {
      skills: [{ type: String }],
      projects: [{ type: String }],
      certifications: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);
