"use strict";

const Joi = require("joi");

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

const fileMetadataSchema = Joi.object({
  projectId: Joi.string().pattern(OBJECT_ID_PATTERN).required().messages({
    "string.pattern.base": "projectId must be a valid MongoDB ObjectId",
  }),
  filename: Joi.string().trim().max(500).optional(),
  originalName: Joi.string().trim().max(500).optional(),
  mimeType: Joi.string().trim().optional(),
  size: Joi.number().integer().min(0).max(MAX_FILE_SIZE_BYTES).optional(),
});

module.exports = {
  fileMetadataSchema,
};
