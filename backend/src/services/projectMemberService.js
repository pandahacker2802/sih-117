"use strict";

const { Project, User, ProjectMember } = require("../models");

const VALID_ROLES = ["OWNER", "MEMBER", "REVIEWER"];

const addMember = async ({ projectId, userId, role }, addedById) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!VALID_ROLES.includes(role)) {
    throw new Error("Invalid project role");
  }

  const existing = await ProjectMember.findOne({ projectId, userId });

  if (existing) {
    throw new Error("User is already a member of this project");
  }

  const member = await ProjectMember.create({
    projectId,
    userId,
    role,
    addedBy: addedById,
  });

  return member.populate(["userId", "addedBy"]);
};

const getProjectMembers = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const members = await ProjectMember.find({ projectId })
    .populate("userId", "-passwordHash")
    .populate("addedBy", "-passwordHash")
    .sort({ createdAt: 1 });

  return members;
};

const updateMemberRole = async ({ projectId, userId, role }) => {
  if (!VALID_ROLES.includes(role)) {
    throw new Error("Invalid project role");
  }

  const member = await ProjectMember.findOneAndUpdate(
    { projectId, userId },
    { $set: { role } },
    { new: true, runValidators: true }
  )
    .populate("userId", "-passwordHash")
    .populate("addedBy", "-passwordHash");

  if (!member) {
    throw new Error("Project member not found");
  }

  return member;
};

const removeMember = async ({ projectId, userId }) => {
  const member = await ProjectMember.findOneAndDelete({ projectId, userId });

  if (!member) {
    throw new Error("Project member not found");
  }

  return member;
};

module.exports = {
  addMember,
  getProjectMembers,
  updateMemberRole,
  removeMember,
};
