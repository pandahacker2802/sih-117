"use strict";

const { ProjectMember } = require("../models");

const requireProjectAccess = (...allowedProjectRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const projectId = req.params.projectId;

      if (!projectId) {
        return res.status(400).json({ success: false, message: "Project ID is required" });
      }

      const membership = await ProjectMember.findOne({
        projectId,
        userId: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (allowedProjectRoles.length > 0 && !allowedProjectRoles.includes(membership.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      req.projectMember = membership;
      next();
    } catch {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
  };
};

module.exports = { requireProjectAccess };
