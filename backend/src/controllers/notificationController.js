"use strict";

const { notificationService } = require("../services");

const getUserNotifications = async (req, res, next) => {
  try {
    const filters = {
      isRead: req.query.isRead !== undefined ? req.query.isRead === "true" : undefined,
      type: req.query.type,
    };
    const options = {
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await notificationService.getUserNotifications(req.user._id, filters, options);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.notificationId,
      req.user._id
    );

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.notificationId, req.user._id);

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserNotifications, markAsRead, markAllAsRead, deleteNotification };
