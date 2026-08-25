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

  const NOT_FOUND_MESSAGES = [
    "User not found",
    "Project not found",
    "File not found",
    "Analysis not found",
    "Report not found",
    "Notification not found",
    "Project member not found",
  ];

  const CONFLICT_MESSAGES = [
    "Employee ID already exists",
    "Email already exists",
    "User is already a member of this project",
  ];

  const UNAUTHORIZED_MESSAGES = [
    "Invalid credentials",
    "Account is inactive",
  ];

  const BAD_REQUEST_MESSAGES = [
    "Current password is incorrect",
    "Reset token is invalid or has expired",
    "Only failed analyses can be retried",
    "Only queued or processing analyses can be cancelled",
    "Only draft reports can be updated",
    "Only draft reports can be submitted for review",
    "Only reports pending review can be approved",
    "Only reports pending review can be rejected",
    "Invalid file status",
    "Invalid analysis status",
    "No valid fields to update",
    "One or more input files are invalid or do not belong to this project",
    "Invalid project role",
    "Analysis does not belong to this project",
  ];

  if (UNAUTHORIZED_MESSAGES.includes(err.message)) {
    return res.status(401).json({ success: false, message: err.message });
  }

  if (CONFLICT_MESSAGES.includes(err.message)) {
    return res.status(409).json({ success: false, message: err.message });
  }

  if (NOT_FOUND_MESSAGES.includes(err.message)) {
    return res.status(404).json({ success: false, message: err.message });
  }

  if (BAD_REQUEST_MESSAGES.includes(err.message)) {
    return res.status(400).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: "Something went wrong" });
};

module.exports = { errorHandler };
