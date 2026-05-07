import { getGroqClient } from "./groq.client.js";
import { parseJsonSafely } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

const toPlainText = (value, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const buildUnavailableVerdict = () => ({
  verdict: "ai_not_available",
  reasoning: "Groq analysis was unavailable for this verification run.",
  suspiciousClaims: [],
  summaryReport: "AI summary was skipped because the Groq service was unavailable.",
});

const buildPrompt = ({ resume, githubAnalysis, certificateAnalysis, evidence }) => ({
  model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  temperature: 0.1,
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content:
        "You are a resume authenticity analyst. For this run, evaluate only project verification and certificate verification. Ignore resume skill claims. Return strict JSON with keys verdict, reasoning, suspiciousClaims, summaryReport. verdict must be one of supported, weakly_supported, unsupported.",
    },
    {
      role: "user",
      content: JSON.stringify({
        resumeProjects: resume?.parsedData?.projects || [],
        resumeCertifications: resume?.parsedData?.certifications || [],
        githubEvidence: githubAnalysis,
        certificateEvidence: certificateAnalysis,
        evidence: {
          projects: evidence.projects,
          certificates: evidence.certificates,
          github: evidence.github,
          metadata: evidence.metadata,
        },
      }),
    },
  ],
});

export const scoreWithAi = async ({
  resume,
  githubAnalysis,
  certificateAnalysis,
  evidence,
}) => {
  if (!process.env.GROQ_API_KEY) {
    return buildUnavailableVerdict();
  }

  const groqClient = getGroqClient();
  const payload = buildPrompt({ resume, githubAnalysis, certificateAnalysis, evidence });

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await groqClient.chat.completions.create(payload);
      const content = response.choices?.[0]?.message?.content || "{}";
      const parsed = parseJsonSafely(content);

      if (
        parsed?.verdict &&
        ["supported", "weakly_supported", "unsupported"].includes(parsed.verdict)
      ) {
        return {
          verdict: parsed.verdict,
          reasoning: toPlainText(parsed.reasoning, ""),
          suspiciousClaims: Array.isArray(parsed.suspiciousClaims)
            ? parsed.suspiciousClaims
            : [],
          summaryReport: toPlainText(
            parsed.summaryReport,
            toPlainText(parsed.reasoning, "")
          ),
        };
      }
    } catch (error) {
      logger.warn("Groq analysis failed", {
        attempt,
        message: error?.message,
      });
    }
  }

  return buildUnavailableVerdict();
};
