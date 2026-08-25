"use strict";

const { Router } = require("express");
const { authenticate, requireProjectAccess, validate } = require("../middleware");
const { createReportSchema, reviewReportSchema, reportEntrySchema } = require("../validators");
const reportController = require("../controllers/reportController");

const router = Router();

router.post(
  "/projects/:projectId/reports",
  authenticate,
  requireProjectAccess(),
  validate(createReportSchema),
  reportController.createReport
);

router.get(
  "/projects/:projectId/reports",
  authenticate,
  requireProjectAccess(),
  reportController.getProjectReports
);

router.get(
  "/projects/:projectId/reports/:reportId",
  authenticate,
  requireProjectAccess(),
  reportController.getReportById
);

router.patch(
  "/reports/:reportId",
  authenticate,
  requireProjectAccess("OWNER"),
  validate(reportEntrySchema),
  reportController.updateReport
);

router.post(
  "/reports/:reportId/submit",
  authenticate,
  requireProjectAccess("OWNER", "MEMBER"),
  reportController.submitForReview
);

router.post(
  "/reports/:reportId/approve",
  authenticate,
  requireProjectAccess("REVIEWER", "OWNER"),
  validate(reviewReportSchema),
  reportController.approveReport
);

router.post(
  "/reports/:reportId/reject",
  authenticate,
  requireProjectAccess("REVIEWER", "OWNER"),
  validate(reviewReportSchema),
  reportController.rejectReport
);

module.exports = router;
