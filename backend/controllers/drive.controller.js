import { Drive } from "../models/drive.model.js";
import { AppError } from "../utils/AppError.js";

export const getDrives = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { companyName: { $regex: search, $options: "i" } },
          { recruiterId: { $regex: search, $options: "i" } },
        ],
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const drives = await Drive.find(query)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Drive.countDocuments(query);

    res.json({
      success: true,
      data: drives,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDriveById = async (req, res, next) => {
  try {
    const { driveId } = req.params;

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return next(new AppError("Drive not found", 404));
    }

    res.json({
      success: true,
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

export const createDrive = async (req, res, next) => {
  try {
    const { companyName, recruiterId, recruiterPassword, deadline } = req.body;

    if (!companyName || !recruiterId || !recruiterPassword) {
      return next(new AppError("Company name, recruiter ID, and password are required", 400));
    }

    const drive = await Drive.create({
      companyName,
      recruiterId,
      recruiterPassword,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    res.status(201).json({
      success: true,
      data: drive,
      message: "Drive created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateDrive = async (req, res, next) => {
  try {
    const { driveId } = req.params;
    const { companyName, recruiterId, recruiterPassword, deadline } = req.body;

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return next(new AppError("Drive not found", 404));
    }

    if (companyName) drive.companyName = companyName;
    if (recruiterId) drive.recruiterId = recruiterId;
    if (recruiterPassword) drive.recruiterPassword = recruiterPassword;
    if (deadline) drive.deadline = new Date(deadline);

    await drive.save();

    res.json({
      success: true,
      data: drive,
      message: "Drive updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDrive = async (req, res, next) => {
  try {
    const { driveId } = req.params;

    const drive = await Drive.findByIdAndDelete(driveId);
    if (!drive) {
      return next(new AppError("Drive not found", 404));
    }

    res.json({
      success: true,
      message: "Drive deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
