export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((err) => err.message)
      .join(", ");
  }

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue)?.[0] || "field";
    message = `${field} is already registered. Please use a different ${field}.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
