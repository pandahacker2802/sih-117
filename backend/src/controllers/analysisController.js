"use strict";

const { analysisService } = require("../services");

const createAnalysis = async (req, res, next) => {
  try {
    const { type, instruction, inputFiles } = req.body;
    const analysis = await analysisService.createAnalysis(
      { projectId: req.params.projectId, type, instruction, inputFiles },
      req.user._id
    );

    return res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await analysisService.getAnalysisById(req.params.analysisId);

    if (analysis.projectId._id
      ? analysis.projectId._id.toString() !== req.params.projectId
      : analysis.projectId.toString() !== req.params.projectId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

const getProjectAnalyses = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await analysisService.getProjectAnalyses(
      req.params.projectId,
      filters,
      options
    );

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateAnalysisStatus = async (req, res, next) => {
  try {
    const { status, result, error, agentPlan } = req.body;
    const analysis = await analysisService.updateAnalysisStatus(
      req.params.analysisId,
      status,
      { result, error, agentPlan }
    );

    return res.status(200).json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
};

const cancelAnalysis = async (req, res, next) => {
  try {
    const analysis = await analysisService.cancelAnalysis(req.params.analysisId, req.user._id);

    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

const retryAnalysis = async (req, res, next) => {
  try {
    const analysis = await analysisService.retryAnalysis(req.params.analysisId, req.user._id);

    return res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnalysis,
  getAnalysisById,
  getProjectAnalyses,
  updateAnalysisStatus,
  cancelAnalysis,
  retryAnalysis,
};
