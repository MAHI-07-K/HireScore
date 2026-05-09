import mongoose from "mongoose";

export const ensureValidStudentId = (studentId) => {
  const normalizedId = normalizeStudentId(studentId);
  if (!normalizedId || typeof normalizedId !== "string" || !mongoose.Types.ObjectId.isValid(normalizedId)) {
    throw new Error("Invalid studentId provided");
  }
  return normalizedId;
};

const normalizeStudentId = (studentId) => {
  if (typeof studentId === "string") return studentId;
  if (studentId && typeof studentId === "object") {
    if (typeof studentId.studentId === "string") return studentId.studentId;
    if (typeof studentId._id === "string") return studentId._id;
    if (typeof studentId.toString === "function") {
      const value = studentId.toString();
      if (value && value !== "[object Object]") return value;
    }
  }
  return studentId;
};