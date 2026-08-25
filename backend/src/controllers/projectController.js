"use strict";

const { projectService } = require("../services");

const createProject = async (req, res, next) => {
  try {
    const { name, description, department } = req.body;
    const project = await projectService.createProject(
      { name, description, department },
      req.user._id
    );

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      department: req.query.department,
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await projectService.getProjects(filters, options);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description, department } = req.body;
    const project = await projectService.updateProject(req.params.projectId, {
      name,
      description,
      department,
    }, req.user._id);

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const archiveProject = async (req, res, next) => {
  try {
    const project = await projectService.archiveProject(req.params.projectId, req.user._id);

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjectById, getProjects, updateProject, archiveProject };
