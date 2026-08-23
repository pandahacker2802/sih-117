"use strict";

const mongoose = require("mongoose");

const FILE_STATUS = {
  UPLOADED: "UPLOADED",
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
  DELETED: "DELETED",
};

const fileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(FILE_STATUS),
      default: FILE_STATUS.UPLOADED,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ projectId: 1, status: 1 });

const File = mongoose.model("File", fileSchema);

module.exports = File;
