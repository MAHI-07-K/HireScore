import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { Resume } from "../models/resume.model.js";
import { parseResumeText } from "../utils/resumeParser.js";
import { AppError } from "../utils/AppError.js";

const parseCertificateLinks = (rawLinks) => {
  if (!rawLinks) return [];

  if (Array.isArray(rawLinks)) {
    return rawLinks.map((link) => String(link).trim()).filter(Boolean);
  }

  return String(rawLinks)
    .split(/\r?\n|,/)
    .map((link) => link.trim())
    .filter(Boolean);
};

export const createResumeFromUpload = async ({ file, body }) => {
  if (!file) {
    throw new AppError("Resume PDF is required", 400);
  }

  // Read the uploaded PDF from disk and extract plain text for downstream analysis.
  const buffer = await fs.readFile(file.path);
  const pdfData = await pdfParse(buffer);
  const extractedText = pdfData.text?.trim();

  if (!extractedText) {
    throw new AppError("Could not extract readable text from the PDF", 422);
  }

  // Phase 1 keeps parsing intentionally lightweight and section-based.
  const parsedData = parseResumeText(extractedText);

  const resume = await Resume.create({
    githubUsername: body.githubUsername,
    certificateLinks: parseCertificateLinks(body.certificateLinks),
    originalFileName: file.originalname,
    storedFileName: file.filename,
    extractedText,
    parsedData,
  });

  return resume;
};
