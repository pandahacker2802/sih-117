"use strict";

const { Router } = require("express");
const { authenticate, requireRole, requireProjectAccess, validate } = require("../middleware");
const { createAnalysisSchema, retryAnalysisSchema } = require("../validators");
const analysisController = require("../controllers/analysisController");

const router = Router();

router.post(
  "/projects/:projectId/analyses",
  authenticate,
  requireProjectAccess(),
  validate(createAnalysisSchema),
  analysisController.createAnalysis
);

router.get(
  "/projects/:projectId/analyses",
  authenticate,
  requireProjectAccess(),
  analysisController.getProjectAnalyses
);

router.get(
  "/projects/:projectId/analyses/:analysisId",
  authenticate,
  requireProjectAccess(),
  analysisController.getAnalysisById
);

router.patch(
  "/analyses/:analysisId/status",
  authenticate,
  requireRole("ADMIN"),
  analysisController.updateAnalysisStatus
);

router.post(
  "/analyses/:analysisId/cancel",
  authenticate,
  analysisController.cancelAnalysis
);

router.post(
  "/analyses/:analysisId/retry",
  authenticate,
  validate(retryAnalysisSchema),
  analysisController.retryAnalysis
);

module.exports = router;
