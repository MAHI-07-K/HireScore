import { AppError } from "../../utils/AppError.js";

export const clampScore = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(Number(value) || 0)));

export const normalizeToken = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const uniqueNormalized = (values = []) => {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const normalized = normalizeToken(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
  }

  return output;
};

export const tokenizeClaim = (value) =>
  normalizeToken(value)
    .split(/\s+/)
    .filter((token) => token.length > 2);

export const keywordOverlapScore = (left, right) => {
  const leftTokens = tokenizeClaim(left);
  const rightTokens = new Set(tokenizeClaim(right));

  if (!leftTokens.length || !rightTokens.size) {
    return 0;
  }

  const matched = leftTokens.filter((token) => rightTokens.has(token)).length;
  return matched / leftTokens.length;
};

export const isLikelyUrl = (value) => {
  try {
    const parsed = new URL(String(value));
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const parseJsonSafely = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const buildHttpError = (message, statusCode = 400) =>
  new AppError(message, statusCode);

export const coerceStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};
