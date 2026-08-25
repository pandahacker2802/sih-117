"use strict";

const { Router } = require("express");
const { authenticate, requireProjectAccess, validate } = require("../middleware");
const { createProjectSchema, updateProjectSchema } = require("../validators");
const projectController = require("../controllers/projectController");
const projectMemberRoutes = require("./projectMemberRoutes");

const router = Router();

router.use("/:projectId/members", projectMemberRoutes);

router.post("/", authenticate, validate(createProjectSchema), projectController.createProject);

router.get("/", authenticate, projectController.getProjects);

router.get(
  "/:projectId",
  authenticate,
  requireProjectAccess(),
  projectController.getProjectById
);

router.patch(
  "/:projectId",
  authenticate,
  requireProjectAccess("OWNER"),
  validate(updateProjectSchema),
  projectController.updateProject
);

router.patch(
  "/:projectId/archive",
  authenticate,
  requireProjectAccess("OWNER"),
  projectController.archiveProject
);

module.exports = router;
