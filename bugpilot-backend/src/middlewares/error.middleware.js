import logger from "../config/logger.js";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new ApiError(409, `${field} already exists`);
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    err = new ApiError(422, messages.join(", "));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") err = new ApiError(401, "Invalid token");
  if (err.name === "TokenExpiredError")  err = new ApiError(401, "Token expired");

  const statusCode = err.statusCode || 500;
  const message    = err.message    || "Internal Server Error";

  if (!err.isOperational) {
    logger.error(`UNHANDLED: ${err.stack}`);
  }

  return res.status(statusCode).json({
    success:  false,
    message,
    errors:   err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;