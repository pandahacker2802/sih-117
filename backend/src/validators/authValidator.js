"use strict";

const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim(),
  employeeId: Joi.string().trim(),
  password: Joi.string().min(3).required(),
}).or("email", "employeeId").messages({
  "object.missing": "Provide either an email or employeeId",
  "object.or": "Provide either an email or employeeId",
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.valid(Joi.ref("newPassword")).required().messages({
    "any.only": "confirmPassword must match newPassword",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.valid(Joi.ref("newPassword")).required().messages({
    "any.only": "confirmPassword must match newPassword",
  }),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
