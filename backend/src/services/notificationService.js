"use strict";

const { Notification } = require("../models");

const createNotification = async ({ userId, type, message, resourceType, resourceId }) => {
  const notification = await Notification.create({
    userId,
    type,
    message,
    resourceType: resourceType || null,
    resourceId: resourceId || null,
    isRead: false,
  });

  return notification;
};

const getUserNotifications = async (userId, filters = {}, options = {}) => {
  const query = { userId };

  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Notification.countDocuments(query),
  ]);

  return { notifications, total, page, limit };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { returnDocument: 'after' }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return { modifiedCount: result.modifiedCount };
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
