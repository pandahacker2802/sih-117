"use strict";

const authController = require("./authController");
const userController = require("./userController");
const projectController = require("./projectController");
const projectMemberController = require("./projectMemberController");
const fileController = require("./fileController");
const analysisController = require("./analysisController");
const reportController = require("./reportController");
const notificationController = require("./notificationController");
const auditController = require("./auditController");

module.exports = {
  authController,
  userController,
  projectController,
  projectMemberController,
  fileController,
  analysisController,
  reportController,
  notificationController,
  auditController,
};
