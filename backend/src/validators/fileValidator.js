"use strict";

const Joi = require("joi");

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

const ALLOWED_CLASSIFICATIONS = ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "HIGHLY_CONFIDENTIAL"];

const fileMetadataSchema = Joi.object({
  filename: Joi.string().trim().max(500).required(),
  originalName: Joi.string().trim().max(500).required(),
  mimeType: Joi.string().trim().required(),
  size: Joi.number().integer().min(0).max(MAX_FILE_SIZE_BYTES).required(),
  storageKey: Joi.string().trim().max(1000).required(),
  classification: Joi.string()
    .valid(...ALLOWED_CLASSIFICATIONS)
    .optional()
    .default("INTERNAL"),
});

module.exports = {
  fileMetadataSchema,
};
