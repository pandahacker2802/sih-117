"use strict";

const Joi = require("joi");

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const ALLOWED_PROJECT_ROLES = ["OWNER", "MEMBER", "REVIEWER"];

const addProjectMemberSchema = Joi.object({
  userId: Joi.string().pattern(OBJECT_ID_PATTERN).required().messages({
    "string.pattern.base": "userId must be a valid MongoDB ObjectId",
  }),
  role: Joi.string().valid(...ALLOWED_PROJECT_ROLES).required(),
});

const updateProjectMemberSchema = Joi.object({
  role: Joi.string().valid(...ALLOWED_PROJECT_ROLES).required(),
});

module.exports = {
  addProjectMemberSchema,
  updateProjectMemberSchema,
};
