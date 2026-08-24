"use strict";

const { authenticate } = require("./authMiddleware");
const { requireRole } = require("./roleMiddleware");
const { requireProjectAccess } = require("./projectAccessMiddleware");
const { errorHandler } = require("./errorMiddleware");

module.exports = {
  authenticate,
  requireRole,
  requireProjectAccess,
  errorHandler,
};
