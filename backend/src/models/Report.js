"use strict";

const mongoose = require("mongoose");

const REPORT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const reportEntrySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: null },
    content: { type: String, trim: true, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: null,
    },
    findings: {
      type: [reportEntrySchema],
      default: [],
    },
    recommendations: {
      type: [reportEntrySchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.DRAFT,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewComment: {
      type: String,
      trim: true,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ createdBy: 1 });
reportSchema.index({ projectId: 1, status: 1 });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
