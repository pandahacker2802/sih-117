"use strict";

const { projectMemberService } = require("../services");

const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const member = await projectMemberService.addMember(
      { projectId: req.params.projectId, userId, role },
      req.user._id
    );

    return res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

const getProjectMembers = async (req, res, next) => {
  try {
    const members = await projectMemberService.getProjectMembers(req.params.projectId);

    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const member = await projectMemberService.updateMemberRole({
      projectId: req.params.projectId,
      userId,
      role,
    });

    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await projectMemberService.removeMember({
      projectId: req.params.projectId,
      userId: req.params.userId,
    });

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { addMember, getProjectMembers, updateMemberRole, removeMember };
