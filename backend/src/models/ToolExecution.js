"use strict";

const mongoose = require("mongoose");

const TOOL_EXECUTION_STATUS = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

const toolExecutionSchema = new mongoose.Schema(
  {
    agentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentRun",
      required: true,
      index: true,
    },
    toolName: {
      type: String,
      required: true,
      trim: true,
    },
    // Flexible field for structured tool input parameters
    input: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Flexible field for structured tool output/result
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TOOL_EXECUTION_STATUS),
      default: TOOL_EXECUTION_STATUS.PENDING,
      index: true,
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

toolExecutionSchema.index({ agentRunId: 1, status: 1 });

const ToolExecution = mongoose.model("ToolExecution", toolExecutionSchema);

module.exports = ToolExecution;
