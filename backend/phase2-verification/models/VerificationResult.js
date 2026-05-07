import mongoose from "mongoose";

const verificationResultSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    githubAnalysis: {
      githubVerified: { type: Boolean, default: false },
      profile: {
        username: { type: String, default: "" },
        publicRepos: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
      },
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      suspiciousSkills: [{ type: String }],
      verifiedProjects: [
        {
          claim: { type: String, default: "" },
          repository: { type: String, default: "" },
          url: { type: String, default: "" },
          matchScore: { type: Number, default: 0 },
        },
      ],
      activityScore: { type: Number, default: 0 },
      fakeGithubRisk: { type: Number, default: 0 },
      contributionHeatmapScore: { type: Number, default: 0 },
      githubScore: { type: Number, default: 0 },
      notes: [{ type: String }],
    },
    certificateAnalysis: {
      certificates: [
        {
          name: { type: String, default: "" },
          issuer: { type: String, default: "" },
          source: { type: String, default: "" },
          candidateName: { type: String, default: "" },
          issueDate: { type: String, default: "" },
          status: {
            type: String,
            enum: ["valid", "invalid", "unverifiable"],
            default: "unverifiable",
          },
          confidence: { type: Number, default: 0 },
          reason: { type: String, default: "" },
        },
      ],
      certificateScore: { type: Number, default: 0 },
    },
    evidence: {
      skills: {
        claimed: [{ type: String }],
        verified: [{ type: String }],
        missing: [{ type: String }],
      },
      projects: {
        claimed: { type: Number, default: 0 },
        verified: { type: Number, default: 0 },
      },
      certificates: {
        valid: { type: Number, default: 0 },
        invalid: { type: Number, default: 0 },
        unverifiable: { type: Number, default: 0 },
      },
      github: {
        githubVerified: { type: Boolean, default: false },
        activityScore: { type: Number, default: 0 },
        githubScore: { type: Number, default: 0 },
      },
      metadata: {
        resumeId: { type: String, default: "" },
        githubUsername: { type: String, default: "" },
        checkedAt: { type: Date, default: Date.now },
      },
    },
    aiAnalysis: {
      verdict: {
        type: String,
        enum: ["supported", "weakly_supported", "unsupported", "ai_not_available"],
        default: "ai_not_available",
      },
      reasoning: { type: String, default: "" },
      suspiciousClaims: [{ type: String }],
      summaryReport: { type: String, default: "" },
    },
    confidenceScore: { type: Number, default: 0 },
    label: { type: String, default: "No Supporting Evidence" },
    breakdown: {
      skills: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      certificates: { type: Number, default: 0 },
      activity: { type: Number, default: 0 },
      penalties: { type: Number, default: 0 },
    },
    confidence: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const VerificationResult = mongoose.model(
  "VerificationResult",
  verificationResultSchema
);
