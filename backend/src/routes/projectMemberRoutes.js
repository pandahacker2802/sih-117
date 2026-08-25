"use strict";

const { Router } = require("express");
const { authenticate, requireProjectAccess, validate } = require("../middleware");
const { addProjectMemberSchema, updateProjectMemberSchema } = require("../validators");
const projectMemberController = require("../controllers/projectMemberController");

const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  requireProjectAccess("OWNER"),
  validate(addProjectMemberSchema),
  projectMemberController.addMember
);

router.get("/", authenticate, requireProjectAccess(), projectMemberController.getProjectMembers);

router.patch(
  "/:userId",
  authenticate,
  requireProjectAccess("OWNER"),
  validate(updateProjectMemberSchema),
  projectMemberController.updateMemberRole
);

router.delete(
  "/:userId",
  authenticate,
  requireProjectAccess("OWNER"),
  projectMemberController.removeMember
);

module.exports = router;
