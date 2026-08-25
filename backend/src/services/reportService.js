"use strict";

const { Report, Project, Analysis } = require("../models");
const auditService = require("./auditService");

const ALLOWED_UPDATE_FIELDS = ["title", "summary", "findings", "recommendations"];

const createReport = async (
  { projectId, analysisId, title, summary, findings, recommendations },
  createdById
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const analysis = await Analysis.findById(analysisId);

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  if (analysis.projectId.toString() !== projectId.toString()) {
    throw new Error("Analysis does not belong to this project");
  }

  const report = await Report.create({
    projectId,
    analysisId,
    createdBy: createdById,
    title,
    summary: summary || null,
    findings: findings || [],
    recommendations: recommendations || [],
    status: "DRAFT",
  });

  auditService.createAuditLog({
    userId: createdById,
    action: "REPORT_CREATED",
    resourceType: "Report",
    resourceId: report._id,
    projectId,
    metadata: { title, analysisId: analysisId.toString() },
  }).catch(console.error);

  return report;
};

const getReportById = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate("projectId")
    .populate("analysisId")
    .populate("createdBy", "-passwordHash")
    .populate("reviewedBy", "-passwordHash");

  if (!report) {
    throw new Error("Report not found");
  }

  return report;
};

const getProjectReports = async (projectId, filters = {}, options = {}) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const query = { projectId };

  if (filters.status) {
    query.status = filters.status;
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find(query)
      .populate("createdBy", "-passwordHash")
      .populate("reviewedBy", "-passwordHash")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Report.countDocuments(query),
  ]);

  return { reports, total, page, limit };
};

const updateReport = async (reportId, updates) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== "DRAFT") {
    throw new Error("Only draft reports can be updated");
  }

  const sanitized = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new Error("No valid fields to update");
  }

  const updated = await Report.findByIdAndUpdate(
    reportId,
    { $set: sanitized },
    { new: true, runValidators: true }
  );

  return updated;
};

const submitForReview = async (reportId, actorId) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== "DRAFT") {
    throw new Error("Only draft reports can be submitted for review");
  }

  const updated = await Report.findByIdAndUpdate(
    reportId,
    { $set: { status: "PENDING_REVIEW" } },
    { new: true }
  );

  auditService.createAuditLog({
    userId: actorId,
    action: "REPORT_SUBMITTED",
    resourceType: "Report",
    resourceId: reportId,
    projectId: report.projectId,
  }).catch(console.error);

  return updated;
};

const approveReport = async (reportId, reviewerId, reviewComment) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== "PENDING_REVIEW") {
    throw new Error("Only reports pending review can be approved");
  }

  const updated = await Report.findByIdAndUpdate(
    reportId,
    {
      $set: {
        status: "APPROVED",
        reviewedBy: reviewerId,
        reviewComment: reviewComment || null,
        reviewedAt: new Date(),
      },
    },
    { new: true }
  )
    .populate("createdBy", "-passwordHash")
    .populate("reviewedBy", "-passwordHash");

  auditService.createAuditLog({
    userId: reviewerId,
    action: "REPORT_APPROVED",
    resourceType: "Report",
    resourceId: reportId,
    projectId: report.projectId,
    metadata: reviewComment ? { reviewComment } : undefined,
  }).catch(console.error);

  return updated;
};

const rejectReport = async (reportId, reviewerId, reviewComment) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  if (report.status !== "PENDING_REVIEW") {
    throw new Error("Only reports pending review can be rejected");
  }

  const updated = await Report.findByIdAndUpdate(
    reportId,
    {
      $set: {
        status: "REJECTED",
        reviewedBy: reviewerId,
        reviewComment: reviewComment || null,
        reviewedAt: new Date(),
      },
    },
    { new: true }
  )
    .populate("createdBy", "-passwordHash")
    .populate("reviewedBy", "-passwordHash");

  auditService.createAuditLog({
    userId: reviewerId,
    action: "REPORT_REJECTED",
    resourceType: "Report",
    resourceId: reportId,
    projectId: report.projectId,
    metadata: reviewComment ? { reviewComment } : undefined,
  }).catch(console.error);

  return updated;
};

module.exports = {
  createReport,
  getReportById,
  getProjectReports,
  updateReport,
  submitForReview,
  approveReport,
  rejectReport,
};
