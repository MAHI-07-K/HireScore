import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const protectRoute = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided. Please login first.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError("Invalid or expired token. Please login again.", 401));
  }
};

export const generateToken = (studentId) => {
  return jwt.sign({ studentId: String(studentId) }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};
