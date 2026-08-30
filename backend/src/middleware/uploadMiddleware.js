"use strict";

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper to sanitize filename and prevent path traversal
const sanitizeFilename = (filename) => {
  if (!filename) return "file";
  const base = path.basename(filename);
  // Keep only alphanumeric, dots, dashes, underscores
  return base.replace(/[^a-zA-Z0-9.\-_]/g, "_");
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectId = req.params.projectId;
    // Base uploads directory relative to process.cwd()
    const uploadDir = path.resolve(process.cwd(), "uploads", projectId);
    
    // Ensure directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized);
    const nameWithoutExt = path.basename(sanitized, ext);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    // Return a unique but identifiable filename to prevent collisions and overwrites
    cb(null, `${nameWithoutExt}-${timestamp}-${randomStr}${ext}`);
  }
});

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit, matching MAX_FILE_SIZE_BYTES in validator
  }
});

module.exports = upload;
