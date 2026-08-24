"use strict";

const { Project } = require("../models");

const ALLOWED_UPDATE_FIELDS = ["name", "description", "department"];

const createProject = async ({ name, description, department }, createdById) => {
  const project = await Project.create({
    name,
    description: description || null,
    department: department || null,
    createdBy: createdById,
    status: "ACTIVE",
  });

  return project;
};

const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId).populate("createdBy", "-passwordHash");

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

const getProjects = async (filters = {}, options = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.createdBy) {
    query.createdBy = filters.createdBy;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate("createdBy", "-passwordHash")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Project.countDocuments(query),
  ]);

  return { projects, total, page, limit };
};

const updateProject = async (projectId, updates) => {
  const sanitized = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new Error("No valid fields to update");
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { $set: sanitized },
    { new: true, runValidators: true }
  ).populate("createdBy", "-passwordHash");

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

const archiveProject = async (projectId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $set: { status: "ARCHIVED" } },
    { new: true }
  );

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

module.exports = {
  createProject,
  getProjectById,
  getProjects,
  updateProject,
  archiveProject,
};
