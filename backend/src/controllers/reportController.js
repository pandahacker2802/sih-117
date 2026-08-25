"use strict";

const { reportService } = require("../services");

const createReport = async (req, res, next) => {
  try {
    const { analysisId, title, summary, findings, recommendations } = req.body;
    const report = await reportService.createReport(
      {
        projectId: req.params.projectId,
        analysisId,
        title,
        summary,
        findings,
        recommendations,
      },
      req.user._id
    );

    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.reportId);

    if (report.projectId._id
      ? report.projectId._id.toString() !== req.params.projectId
      : report.projectId.toString() !== req.params.projectId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const getProjectReports = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await reportService.getProjectReports(req.params.projectId, filters, options);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const { title, summary, findings, recommendations } = req.body;
    const report = await reportService.updateReport(req.params.reportId, {
      title,
      summary,
      findings,
      recommendations,
    });

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const submitForReview = async (req, res, next) => {
  try {
    const report = await reportService.submitForReview(req.params.reportId, req.user._id);

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const approveReport = async (req, res, next) => {
  try {
    const { reviewComment } = req.body;
    const report = await reportService.approveReport(
      req.params.reportId,
      req.user._id,
      reviewComment
    );

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const rejectReport = async (req, res, next) => {
  try {
    const { reviewComment } = req.body;
    const report = await reportService.rejectReport(
      req.params.reportId,
      req.user._id,
      reviewComment
    );

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
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
