"use strict";

const mongoose = require("mongoose");

const PROJECT_STATUS = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
};

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ createdBy: 1 });
projectSchema.index({ department: 1 });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
