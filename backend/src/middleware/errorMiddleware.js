"use strict";

const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const statusCode = err.statusCode || err.status || 500;

  if (isDevelopment) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode}: ${err.message}`);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Validation failed" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Conflict: duplicate entry" });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid identifier format" });
  }

  if (statusCode === 401) {
    return res.status(401).json({ success: false, message: err.message || "Unauthorized" });
  }

  if (statusCode === 403) {
    return res.status(403).json({ success: false, message: err.message || "Forbidden" });
  }

  if (statusCode === 404) {
    return res.status(404).json({ success: false, message: err.message || "Not found" });
  }

  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({ success: false, message: err.message || "Bad request" });
  }

  return res.status(500).json({ success: false, message: "Something went wrong" });
};

module.exports = { errorHandler };
