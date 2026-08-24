"use strict";

const Joi = require("joi");

const reportEntrySchema = Joi.object({
  title: Joi.string().trim().max(500).allow(null, "").optional(),
  content: Joi.string().trim().required(),
  order: Joi.number().integer().min(0).optional(),
});

const createReportSchema = Joi.object({
  title: Joi.string().trim().max(500).required(),
  summary: Joi.string().trim().max(5000).allow(null, "").optional(),
  findings: Joi.array().items(reportEntrySchema).optional(),
  recommendations: Joi.array().items(reportEntrySchema).optional(),
});

const reviewReportSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
  reviewComment: Joi.string().trim().max(2000).allow(null, "").optional(),
});

module.exports = {
  createReportSchema,
  reviewReportSchema,
  reportEntrySchema,
};
