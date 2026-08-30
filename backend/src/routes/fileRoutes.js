"use strict";

const { Router } = require("express");
const { authenticate, requireRole, requireProjectAccess, validate, upload } = require("../middleware");
const { fileMetadataSchema } = require("../validators");
const fileController = require("../controllers/fileController");

const router = Router();

router.post(
  "/projects/:projectId/files",
  authenticate,
  requireProjectAccess(),
  upload.single("file"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    // Set up req.body fields for validation and subsequent service call
    req.body.originalName = req.file.originalname;
    req.body.mimeType = req.file.mimetype;
    req.body.size = req.file.size;
    req.body.filename = req.file.filename;
    // storageKey should be: uploads/<projectId>/<filename>
    req.body.storageKey = `uploads/${req.params.projectId}/${req.file.filename}`;
    next();
  },
  validate(fileMetadataSchema),
  fileController.registerFile,
  (err, req, res, next) => {
    if (req.file && req.file.path) {
      const fs = require("fs");
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (unlinkErr) {
        console.error("Failed to delete orphaned file:", unlinkErr);
      }
    }
    next(err);
  }
);

router.get(
  "/projects/:projectId/files",
  authenticate,
  requireProjectAccess(),
  fileController.getProjectFiles
);

router.get(
  "/projects/:projectId/files/:fileId",
  authenticate,
  requireProjectAccess(),
  fileController.getFileById
);

router.patch(
  "/files/:fileId/status",
  authenticate,
  requireRole("ADMIN"),
  fileController.updateFileStatus
);

router.delete(
  "/files/:fileId",
  authenticate,
  requireRole("ADMIN"),
  fileController.deleteFileMetadata
);

module.exports = router;
