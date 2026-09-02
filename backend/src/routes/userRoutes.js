"use strict";

const { Router } = require("express");
const { authenticate, requireRole, validate } = require("../middleware");
const { createUserSchema, updateUserSchema } = require("../validators");
const userController = require("../controllers/userController");

const router = Router();
const allowedUserRoles = ["ADMIN", "SUPERVISOR"];

router.post(
  "/",
  authenticate,
  requireRole(...allowedUserRoles),
  validate(createUserSchema),
  userController.createUser
);

router.get("/", authenticate, requireRole(...allowedUserRoles), userController.getUsers);

router.get("/:id", authenticate, requireRole(...allowedUserRoles), userController.getUserById);

router.patch(
  "/:id",
  authenticate,
  requireRole(...allowedUserRoles),
  validate(updateUserSchema),
  userController.updateUser
);

router.patch("/:id/activate", authenticate, requireRole(...allowedUserRoles), userController.activateUser);

router.patch("/:id/deactivate", authenticate, requireRole(...allowedUserRoles), userController.deactivateUser);

module.exports = router;
