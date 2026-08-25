"use strict";

const { Router } = require("express");
const { authenticate, requireRole } = require("../middleware");
const auditController = require("../controllers/auditController");

const router = Router();

router.get("/", authenticate, requireRole("ADMIN"), auditController.getAuditLogs);

router.get(
  "/projects/:projectId",
  authenticate,
  requireRole("ADMIN"),
  auditController.getProjectAuditActivity
);

module.exports = router;
