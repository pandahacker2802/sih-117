"use strict";

const { authenticate } = require("./authMiddleware");
const { requireRole } = require("./roleMiddleware");
const { requireProjectAccess } = require("./projectAccessMiddleware");
const { errorHandler } = require("./errorMiddleware");
const validate = require("./validateMiddleware");
const upload = require("./uploadMiddleware");

module.exports = {
  authenticate,
  requireRole,
  requireProjectAccess,
  errorHandler,
  validate,
  upload,
};
