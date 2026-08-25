"use strict";

const { Analysis, Project, File } = require("../models");
const auditService = require("./auditService");

const RETRYABLE_STATUSES = ["FAILED"];

const createAnalysis = async (
  { projectId, type, instruction, inputFiles },
  createdById
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (inputFiles && inputFiles.length > 0) {
    const fileCount = await File.countDocuments({
      _id: { $in: inputFiles },
      projectId,
      status: { $ne: "DELETED" },
    });

    if (fileCount !== inputFiles.length) {
      throw new Error("One or more input files are invalid or do not belong to this project");
    }
  }

  const analysis = await Analysis.create({
    projectId,
    createdBy: createdById,
    type,
    instruction: instruction || null,
    inputFiles: inputFiles || [],
    status: "QUEUED",
  });

  auditService.createAuditLog({
    userId: createdById,
    action: "ANALYSIS_CREATED",
    resourceType: "Analysis",
    resourceId: analysis._id,
    projectId,
    metadata: { type },
  }).catch(console.error);

  return analysis;
};

const getAnalysisById = async (analysisId) => {
  const analysis = await Analysis.findById(analysisId)
    .populate("projectId")
    .populate("createdBy", "-passwordHash")
    .populate("inputFiles");

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  return analysis;
};

const getProjectAnalyses = async (projectId, filters = {}, options = {}) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const query = { projectId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    Analysis.find(query)
      .populate("createdBy", "-passwordHash")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Analysis.countDocuments(query),
  ]);

  return { analyses, total, page, limit };
};

const updateAnalysisStatus = async (analysisId, status, extras = {}) => {
  const validStatuses = ["QUEUED", "PROCESSING", "COMPLETED", "FAILED"];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid analysis status");
  }

  const update = { status };

  if (status === "PROCESSING") {
    update.startedAt = new Date();
  }

  if (status === "COMPLETED" || status === "FAILED") {
    update.completedAt = new Date();
  }

  if (extras.result !== undefined) {
    update.result = extras.result;
  }

  if (extras.error !== undefined) {
    update.error = extras.error;
  }

  if (extras.agentPlan !== undefined) {
    update.agentPlan = extras.agentPlan;
  }

  const analysis = await Analysis.findByIdAndUpdate(
    analysisId,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  return analysis;
};

const cancelAnalysis = async (analysisId, actorId) => {
  const analysis = await Analysis.findById(analysisId);

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  if (!["QUEUED", "PROCESSING"].includes(analysis.status)) {
    throw new Error("Only queued or processing analyses can be cancelled");
  }

  const updated = await Analysis.findByIdAndUpdate(
    analysisId,
    { $set: { status: "FAILED", completedAt: new Date() } },
    { new: true }
  );

  auditService.createAuditLog({
    userId: actorId,
    action: "ANALYSIS_CANCELLED",
    resourceType: "Analysis",
    resourceId: analysisId,
    projectId: analysis.projectId,
  }).catch(console.error);

  return updated;
};

const retryAnalysis = async (analysisId, createdById) => {
  const original = await Analysis.findById(analysisId);

  if (!original) {
    throw new Error("Analysis not found");
  }

  if (!RETRYABLE_STATUSES.includes(original.status)) {
    throw new Error("Only failed analyses can be retried");
  }

  const retry = await Analysis.create({
    projectId: original.projectId,
    createdBy: createdById,
    type: original.type,
    instruction: original.instruction,
    inputFiles: original.inputFiles,
    status: "QUEUED",
  });

  auditService.createAuditLog({
    userId: createdById,
    action: "ANALYSIS_RETRIED",
    resourceType: "Analysis",
    resourceId: retry._id,
    projectId: original.projectId,
    metadata: { originalAnalysisId: analysisId.toString() },
  }).catch(console.error);

  return retry;
};

module.exports = {
  createAnalysis,
  getAnalysisById,
  getProjectAnalyses,
  updateAnalysisStatus,
  cancelAnalysis,
  retryAnalysis,
};
