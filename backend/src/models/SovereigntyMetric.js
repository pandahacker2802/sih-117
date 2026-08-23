const mongoose = require("mongoose");

const sovereigntyMetricSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      unique: true,
      index: true,
    },

    localInference: {
      type: Boolean,
      default: false,
    },

    localStorage: {
      type: Boolean,
      default: false,
    },

    zeroExternalCalls: {
      type: Boolean,
      default: false,
    },

    sandboxExecution: {
      type: Boolean,
      default: false,
    },

    ragGrounding: {
      type: Boolean,
      default: false,
    },

    auditLogging: {
      type: Boolean,
      default: false,
    },

    humanApproval: {
      type: Boolean,
      default: false,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SovereigntyMetric",
  sovereigntyMetricSchema
);