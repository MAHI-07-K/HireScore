import axios from "axios";
import * as cheerio from "cheerio";
import {
  clampScore,
  isLikelyUrl,
  keywordOverlapScore,
  uniqueNormalized,
} from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

const httpClient = axios.create({
  timeout: 12000,
  maxRedirects: 5,
  validateStatus: () => true,
  headers: {
    "User-Agent": "HireScore Verification Engine/1.0",
  },
});

const knownIssuers = [
  "coursera",
  "udemy",
  "simplilearn",
  "linkedin learning",
  "google",
  "microsoft",
  "aws",
  "edx",
  "hackerrank",
  "great learning",
];

const inferIssuer = ($, url, titleText) => {
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const pageText = [titleText, hostname, $("body").text().slice(0, 1000)]
    .join(" ")
    .toLowerCase();

  const matchedIssuer = knownIssuers.find((issuer) => pageText.includes(issuer));
  return matchedIssuer || hostname || "Unknown issuer";
};

const inferIssueDate = (text) => {
  const match = text.match(
    /\b(?:issued|issue date|completed|awarded)\b[:\s-]*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i
  );
  return match?.[1] || "";
};

const confidenceFromStatus = (status, hasIssuer, hasDate, nameMatched) => {
  const base =
    status === "valid" ? 0.72 : status === "unverifiable" ? 0.45 : 0.12;
  const bonus = (hasIssuer ? 0.1 : 0) + (hasDate ? 0.05 : 0) + (nameMatched ? 0.08 : 0);
  return Math.min(0.98, Number((base + bonus).toFixed(2)));
};

const verifySingleCertificate = async ({ claim, source, candidateName }) => {
  if (!source) {
    return {
      name: claim || "",
      issuer: "",
      source: "",
      candidateName: "",
      issueDate: "",
      status: "unverifiable",
      confidence: 0.2,
      reason: "No certificate source was provided.",
    };
  }

  if (!isLikelyUrl(source)) {
    return {
      name: claim || source,
      issuer: "Unknown issuer",
      source,
      candidateName: "",
      issueDate: "",
      status: "unverifiable",
      confidence: 0.35,
      reason: "Certificate source is not a supported URL.",
    };
  }

  try {
    const response = await httpClient.get(source);

    if (response.status >= 400) {
      return {
        name: claim || "",
        issuer: "",
        source,
        candidateName: "",
        issueDate: "",
        status: "invalid",
        confidence: 0.1,
        reason: `Certificate URL returned HTTP ${response.status}.`,
      };
    }

    const html = typeof response.data === "string" ? response.data : "";
    const $ = cheerio.load(html);
    const titleText = $("title").text().trim();
    const visibleText = $("body").text().replace(/\s+/g, " ").trim();
    const combinedText = `${titleText} ${visibleText}`.trim();
    const issuer = inferIssuer($, source, titleText);
    const issueDate = inferIssueDate(combinedText);

    const normalizedClaim = uniqueNormalized([claim])[0] || "";
    const titleScore = keywordOverlapScore(normalizedClaim, titleText);
    const bodyScore = keywordOverlapScore(normalizedClaim, combinedText.slice(0, 1200));
    const claimMatched = Math.max(titleScore, bodyScore) >= 0.3;
    const visibleCandidateMatch = candidateName
      ? combinedText.toLowerCase().includes(candidateName.toLowerCase())
      : false;

    const status = claimMatched || visibleCandidateMatch
      ? "valid"
      : combinedText.length > 200
        ? "unverifiable"
        : "invalid";

    return {
      name: claim || titleText || "Certificate",
      issuer,
      source,
      candidateName: visibleCandidateMatch ? candidateName : "",
      issueDate,
      status,
      confidence: confidenceFromStatus(
        status,
        Boolean(issuer),
        Boolean(issueDate),
        visibleCandidateMatch
      ),
      reason:
        status === "valid"
          ? "Certificate page was reachable and contained matching evidence."
          : status === "invalid"
            ? "Certificate page did not contain matching evidence."
            : "Certificate page was reachable but did not expose enough structured proof.",
    };
  } catch {
    logger.warn("Certificate verification fetch failed", { source });
    return {
      name: claim || "",
      issuer: "",
      source,
      candidateName: "",
      issueDate: "",
      status: "unverifiable",
      confidence: 0.25,
      reason: "Certificate page could not be fetched or parsed.",
    };
  }
};

export const verifyCertificates = async ({
  extractedCertificates = [],
  certificateLinks = [],
  candidateName = "",
}) => {
  const normalizedClaims = extractedCertificates.filter(Boolean);
  const sources = certificateLinks.filter(Boolean);
  const maxItems = Math.max(normalizedClaims.length, sources.length);
  const tasks = Array.from({ length: maxItems || sources.length || normalizedClaims.length }, (_, index) =>
    verifySingleCertificate({
      claim: normalizedClaims[index] || normalizedClaims[0] || "",
      source: sources[index] || sources[0] || "",
      candidateName,
    })
  );

  const certificates = maxItems ? await Promise.all(tasks) : [];

  const counts = certificates.reduce(
    (accumulator, certificate) => {
      accumulator[certificate.status] += 1;
      return accumulator;
    },
    { valid: 0, invalid: 0, unverifiable: 0 }
  );

  const scoreBase = certificates.length
    ? (counts.valid / certificates.length) * 100 +
      (counts.unverifiable / certificates.length) * 20 -
      (counts.invalid / certificates.length) * 20
    : 0;

  return {
    certificates,
    certificateScore: clampScore(scoreBase),
  };
};
