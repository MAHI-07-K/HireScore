import { createResumeFromUpload } from "../services/resume.service.js";

export const uploadResumeController = async (req, res, next) => {
  try {
    const resume = await createResumeFromUpload({
      file: req.file,
      body: req.body,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      data: {
        id: resume._id,
        githubUsername: resume.githubUsername,
        certificateLinks: resume.certificateLinks,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
