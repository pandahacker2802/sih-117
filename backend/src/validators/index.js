"use strict";

const {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("./authValidator");

const { createUserSchema, updateUserSchema } = require("./userValidator");

const { createProjectSchema, updateProjectSchema } = require("./projectValidator");

const {
  addProjectMemberSchema,
  updateProjectMemberSchema,
} = require("./projectMemberValidator");

const { fileMetadataSchema } = require("./fileValidator");

const { createAnalysisSchema, retryAnalysisSchema } = require("./analysisValidator");

const {
  createReportSchema,
  reviewReportSchema,
  reportEntrySchema,
} = require("./reportValidator");

module.exports = {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  createUserSchema,
  updateUserSchema,

  createProjectSchema,
  updateProjectSchema,

  addProjectMemberSchema,
  updateProjectMemberSchema,

  fileMetadataSchema,

  createAnalysisSchema,
  retryAnalysisSchema,

  createReportSchema,
  reviewReportSchema,
  reportEntrySchema,
};
