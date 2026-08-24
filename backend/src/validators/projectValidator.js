"use strict";

const Joi = require("joi");

const createProjectSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(2000).allow(null, "").optional(),
  department: Joi.string().trim().allow(null, "").optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().max(200),
  description: Joi.string().trim().max(2000).allow(null, ""),
  department: Joi.string().trim().allow(null, ""),
  status: Joi.string().valid("ACTIVE", "ARCHIVED"),
}).min(1);

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};
