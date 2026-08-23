"use strict";

const mongoose = require("mongoose");

const AGENT_RUN_STATUS = {
  QUEUED: "QUEUED",
  PLANNING: "PLANNING",
  EXECUTING: "EXECUTING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

const agentRunSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AGENT_RUN_STATUS),
      default: AGENT_RUN_STATUS.QUEUED,
      index: true,
    },
    // Flexible field to store the agent execution plan
    plan: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Flexible field to store the final agent output
    finalOutput: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

const AgentRun = mongoose.model("AgentRun", agentRunSchema);

module.exports = AgentRun;
