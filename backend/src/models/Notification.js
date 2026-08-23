"use strict";

const mongoose = require("mongoose");

const NOTIFICATION_TYPES = {
  ANALYSIS_COMPLETED: "ANALYSIS_COMPLETED",
  REPORT_APPROVED: "REPORT_APPROVED",
  REPORT_REJECTED: "REPORT_REJECTED",
  PROJECT_ADDED: "PROJECT_ADDED",
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  SYSTEM: "SYSTEM",
};

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional: the resource model name (e.g. "Report", "Analysis", "Project")
    resourceType: {
      type: String,
      trim: true,
      default: null,
    },
    // Optional: the ObjectId of the related resource (stored as String for flexibility)
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
