"use strict";

const Joi = require("joi");

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const reportEntrySchema = Joi.object({
  title: Joi.string().trim().max(500).allow(null, "").optional(),
  content: Joi.string().trim().required(),
  order: Joi.number().integer().min(0).optional(),
});

const createReportSchema = Joi.object({
  analysisId: Joi.string().pattern(OBJECT_ID_PATTERN).required().messages({
    "string.pattern.base": "analysisId must be a valid MongoDB ObjectId",
  }),
  title: Joi.string().trim().max(500).required(),
  summary: Joi.string().trim().max(5000).allow(null, "").optional(),
  findings: Joi.array().items(reportEntrySchema).optional(),
  recommendations: Joi.array().items(reportEntrySchema).optional(),
});

const updateReportSchema = Joi.object({
  title: Joi.string().trim().max(500),
  summary: Joi.string().trim().max(5000).allow(null, ""),
  findings: Joi.array().items(reportEntrySchema),
  recommendations: Joi.array().items(reportEntrySchema),
}).min(1);

const reviewReportSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  reviewComment: Joi.string().trim().max(2000).allow(null, "").optional(),
});

module.exports = {
  createReportSchema,
  updateReportSchema,
  reviewReportSchema,
  reportEntrySchema,
};
