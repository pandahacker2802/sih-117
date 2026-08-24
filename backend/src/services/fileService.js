"use strict";

const { File, Project } = require("../models");

const ALLOWED_STATUSES = ["UPLOADED", "PROCESSING", "READY", "FAILED", "DELETED"];

const registerFile = async (
  { projectId, filename, originalName, mimeType, size, storageKey, classification },
  uploadedById
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const file = await File.create({
    projectId,
    uploadedBy: uploadedById,
    filename,
    originalName,
    mimeType,
    size,
    storageKey,
    classification: classification || "INTERNAL",
    status: "UPLOADED",
  });

  return file;
};

const getFileById = async (fileId) => {
  const file = await File.findById(fileId)
    .populate("projectId")
    .populate("uploadedBy", "-passwordHash");

  if (!file) {
    throw new Error("File not found");
  }

  return file;
};

const getProjectFiles = async (projectId, filters = {}, options = {}) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const query = { projectId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.classification) {
    query.classification = filters.classification;
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    File.find(query)
      .populate("uploadedBy", "-passwordHash")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    File.countDocuments(query),
  ]);

  return { files, total, page, limit };
};

const updateFileStatus = async (fileId, status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid file status");
  }

  const file = await File.findByIdAndUpdate(
    fileId,
    { $set: { status } },
    { new: true, runValidators: true }
  );

  if (!file) {
    throw new Error("File not found");
  }

  return file;
};

const deleteFileMetadata = async (fileId) => {
  const file = await File.findByIdAndUpdate(
    fileId,
    { $set: { status: "DELETED" } },
    { new: true }
  );

  if (!file) {
    throw new Error("File not found");
  }

  return file;
};

module.exports = {
  registerFile,
  getFileById,
  getProjectFiles,
  updateFileStatus,
  deleteFileMetadata,
};
