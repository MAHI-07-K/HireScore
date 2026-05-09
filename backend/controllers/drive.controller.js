import { Drive } from "../models/drive.model.js";
import { AppError } from "../utils/AppError.js";

export const getDrives = async (req, res, next) => {
  try {
    const { search, sortBy = "postedDate", sortOrder = "desc", page = 1, limit = 10 } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const drives = await Drive.find(query)
      .sort(sortObj)
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
    const { title, company, description, location, applicationUrl, eligibilityCriteria, deadline } = req.body;

    if (!title || !company) {
      return next(new AppError("Title and company are required", 400));
    }

    const drive = await Drive.create({
      title,
      company,
      description,
      location,
      applicationUrl,
      eligibilityCriteria,
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
    const { title, company, description, location, applicationUrl, eligibilityCriteria, deadline } = req.body;

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return next(new AppError("Drive not found", 404));
    }

    if (title) drive.title = title;
    if (company) drive.company = company;
    if (description !== undefined) drive.description = description;
    if (location !== undefined) drive.location = location;
    if (applicationUrl !== undefined) drive.applicationUrl = applicationUrl;
    if (eligibilityCriteria !== undefined) drive.eligibilityCriteria = eligibilityCriteria;
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
