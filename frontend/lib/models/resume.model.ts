import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    extractedText: { type: String },
    parsedData: {
      skills: [{ type: String }],
      projects: [
        {
          name: { type: String },
          description: { type: String },
          technologies: [{ type: String }],
          githubUrl: { type: String },
        },
      ],
      certifications: [
        {
          name: { type: String },
          issuer: { type: String },
          date: { type: String },
        },
      ],
    },
    githubUsername: { type: String },
    certificateLinks: [{ type: String }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  },
  {
    timestamps: true,
  }
);

export const Resume =
  mongoose.models.Resume || mongoose.model("Resume", resumeSchema);
