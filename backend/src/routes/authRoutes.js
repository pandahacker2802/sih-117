"use strict";

const { Router } = require("express");
const { authenticate, validate } = require("../middleware");
const {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators");
const authController = require("../controllers/authController");

const router = Router();

router.post("/login", validate(loginSchema), authController.login);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);

router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
