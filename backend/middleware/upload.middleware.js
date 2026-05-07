import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDirectory = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const pdfOnlyFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (file.mimetype === "application/pdf" && extension === ".pdf") {
    cb(null, true);
    return;
  }

  cb(new Error("Only PDF files are supported"));
};

export const uploadResume = multer({
  storage,
  fileFilter: pdfOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
