"use strict";

const { AuditLog } = require("../models");

const createAuditLog = async ({
  userId,
  action,
  resourceType,
  resourceId,
  projectId,
  status,
  metadata,
  ipAddress,
}) => {
  const safeMetadata = metadata ? sanitizeMetadata(metadata) : null;

  const log = await AuditLog.create({
    userId: userId || null,
    action,
    resourceType: resourceType || null,
    resourceId: resourceId || null,
    metadata: safeMetadata,
    ipAddress: ipAddress || null,
    status: status || "SUCCESS",
  });

  return log;
};

const sanitizeMetadata = (metadata) => {
  const blocked = ["passwordHash", "password", "token", "secret", "jwtSecret", "resetToken"];
  const cleaned = { ...metadata };

  for (const key of blocked) {
    delete cleaned[key];
  }

  return cleaned;
};

const getAuditLogs = async (filters = {}, options = {}) => {
  const query = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.resourceType) {
    query.resourceType = filters.resourceType;
  }

  if (filters.resourceId) {
    query.resourceId = filters.resourceId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from || filters.to) {
    query.createdAt = {};

    if (filters.from) {
      query.createdAt.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.createdAt.$lte = new Date(filters.to);
    }
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(200, Math.max(1, options.limit || 50));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate("userId", "-passwordHash")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total, page, limit };
};

const getProjectAuditActivity = async (projectId, options = {}) => {
  const query = {
    resourceType: { $in: ["Project", "Analysis", "Report", "File", "ProjectMember"] },
    resourceId: projectId,
  };

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(200, Math.max(1, options.limit || 50));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate("userId", "-passwordHash")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total, page, limit };
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getProjectAuditActivity,
};
