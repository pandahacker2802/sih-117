"use strict";

const { auditService } = require("../services");

const getAuditLogs = async (req, res, next) => {
  try {
    const filters = {
      userId: req.query.userId,
      action: req.query.action,
      resourceType: req.query.resourceType,
      resourceId: req.query.resourceId,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await auditService.getAuditLogs(filters, options);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getProjectAuditActivity = async (req, res, next) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await auditService.getProjectAuditActivity(req.params.projectId, options);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs, getProjectAuditActivity };
