"use strict";

const Joi = require("joi");

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const ALLOWED_ANALYSIS_TYPES = ["DOCUMENT", "IMAGE", "MULTIMODAL", "GENERAL"];

const createAnalysisSchema = Joi.object({
  type: Joi.string().valid(...ALLOWED_ANALYSIS_TYPES).required(),
  instruction: Joi.string().trim().max(5000).optional().allow(null, ""),
  inputFiles: Joi.array()
    .items(
      Joi.string().pattern(OBJECT_ID_PATTERN).messages({
        "string.pattern.base": "Each inputFiles entry must be a valid MongoDB ObjectId",
      })
    )
    .min(1)
    .max(20)
    .required(),
});

const retryAnalysisSchema = Joi.object({});

module.exports = {
  createAnalysisSchema,
  retryAnalysisSchema,
};
