const mongoose = require("mongoose");

const lineageStepSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "SOURCE_DOCUMENT",
        "OCR",
        "RAG_RETRIEVAL",
        "MODEL_INFERENCE",
        "TOOL_EXECUTION",
        "VERIFICATION",
        "OUTPUT_GENERATION",
      ],
      required: true,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const dataLineageSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      unique: true,
      index: true,
    },

    steps: {
      type: [lineageStepSchema],
      default: [],
    },

    finalOutputId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DataLineage",
  dataLineageSchema
);