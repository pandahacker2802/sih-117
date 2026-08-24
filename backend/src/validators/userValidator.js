"use strict";

const Joi = require("joi");

const ALLOWED_ROLES = ["EMPLOYEE", "SUPERVISOR", "ADMIN"];

const createUserSchema = Joi.object({
  employeeId: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
  department: Joi.string().trim().required(),
  role: Joi.string().valid(...ALLOWED_ROLES).required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim(),
  department: Joi.string().trim().allow(null, ""),
  role: Joi.string().valid(...ALLOWED_ROLES),
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema,
};
