"use strict";

const { Router } = require("express");
const { authenticate, requireRole, validate } = require("../middleware");
const { createUserSchema, updateUserSchema } = require("../validators");
const userController = require("../controllers/userController");

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createUserSchema),
  userController.createUser
);

router.get("/", authenticate, requireRole("ADMIN"), userController.getUsers);

router.get("/:id", authenticate, requireRole("ADMIN"), userController.getUserById);

router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(updateUserSchema),
  userController.updateUser
);

router.patch("/:id/activate", authenticate, requireRole("ADMIN"), userController.activateUser);

router.patch("/:id/deactivate", authenticate, requireRole("ADMIN"), userController.deactivateUser);

module.exports = router;
