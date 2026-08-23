"use strict";

const mongoose = require("mongoose");

const ANALYSIS_TYPES = {
  DOCUMENT: "DOCUMENT",
  IMAGE: "IMAGE",
  MULTIMODAL: "MULTIMODAL",
  GENERAL: "GENERAL",
};

const ANALYSIS_STATUS = {
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

const analysisSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ANALYSIS_TYPES),
      required: true,
    },
    instruction: {
      type: String,
      trim: true,
      default: null,
    },
    inputFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
    status: {
      type: String,
      enum: Object.values(ANALYSIS_STATUS),
      default: ANALYSIS_STATUS.QUEUED,
      index: true,
    },
    agentPlan: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      message: { type: String, default: null },
      code: { type: String, default: null },
      details: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

analysisSchema.index({ projectId: 1, status: 1 });
analysisSchema.index({ createdBy: 1 });

const Analysis = mongoose.model("Analysis", analysisSchema);

module.exports = Analysis;
