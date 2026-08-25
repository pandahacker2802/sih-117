"use strict";

const { fileService } = require("../services");

const registerFile = async (req, res, next) => {
  try {
    const { filename, originalName, mimeType, size, storageKey, classification } = req.body;
    const file = await fileService.registerFile(
      {
        projectId: req.params.projectId,
        filename,
        originalName,
        mimeType,
        size,
        storageKey,
        classification,
      },
      req.user._id
    );

    return res.status(201).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

const getFileById = async (req, res, next) => {
  try {
    const file = await fileService.getFileById(req.params.fileId);

    if (file.projectId._id
      ? file.projectId._id.toString() !== req.params.projectId
      : file.projectId.toString() !== req.params.projectId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

const getProjectFiles = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      classification: req.query.classification,
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await fileService.getProjectFiles(req.params.projectId, filters, options);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateFileStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const file = await fileService.updateFileStatus(req.params.fileId, status);

    return res.status(200).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

const deleteFileMetadata = async (req, res, next) => {
  try {
    const file = await fileService.deleteFileMetadata(req.params.fileId, req.user._id);

    return res.status(200).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerFile,
  getFileById,
  getProjectFiles,
  updateFileStatus,
  deleteFileMetadata,
};
