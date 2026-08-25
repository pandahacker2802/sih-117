"use strict";

const { Router } = require("express");
const { authenticate, requireRole, requireProjectAccess, validate } = require("../middleware");
const { fileMetadataSchema } = require("../validators");
const fileController = require("../controllers/fileController");

const router = Router();

router.post(
  "/projects/:projectId/files",
  authenticate,
  requireProjectAccess(),
  validate(fileMetadataSchema),
  fileController.registerFile
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
