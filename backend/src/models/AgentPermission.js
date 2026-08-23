const mongoose = require("mongoose");

const agentPermissionSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    permissions: {
      readInternalReports: {
        type: Boolean,
        default: false,
      },

      useLocalRAG: {
        type: Boolean,
        default: false,
      },

      runCodeInSandbox: {
        type: Boolean,
        default: false,
      },

      useOCR: {
        type: Boolean,
        default: false,
      },

      analyzeImages: {
        type: Boolean,
        default: false,
      },

      createFiles: {
        type: Boolean,
        default: false,
      },

      internetAccess: {
        type: Boolean,
        default: false,
      },

      externalApiAccess: {
        type: Boolean,
        default: false,
      },

      externalExport: {
        type: Boolean,
        default: false,
      },
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AgentPermission",
  agentPermissionSchema
);