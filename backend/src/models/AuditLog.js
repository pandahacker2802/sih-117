"use strict";

const mongoose = require("mongoose");

const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DISABLED: "USER_DISABLED",
  ROLE_CHANGED: "ROLE_CHANGED",
  FILE_UPLOADED: "FILE_UPLOADED",
  FILE_DELETED: "FILE_DELETED",
  ANALYSIS_CREATED: "ANALYSIS_CREATED",
  AI_EXECUTION_STARTED: "AI_EXECUTION_STARTED",
  AI_EXECUTION_COMPLETED: "AI_EXECUTION_COMPLETED",
  AI_EXECUTION_FAILED: "AI_EXECUTION_FAILED",
  REPORT_CREATED: "REPORT_CREATED",
  REPORT_APPROVED: "REPORT_APPROVED",
  REPORT_REJECTED: "REPORT_REJECTED",
};

const AUDIT_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      trim: true,
      default: null,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(AUDIT_STATUS),
      required: true,
      default: AUDIT_STATUS.SUCCESS,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
