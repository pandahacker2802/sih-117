"use strict";

const { Router } = require("express");
const { authenticate } = require("../middleware");
const notificationController = require("../controllers/notificationController");

const router = Router();

router.get("/", authenticate, notificationController.getUserNotifications);

router.patch("/read-all", authenticate, notificationController.markAllAsRead);

router.patch("/:notificationId/read", authenticate, notificationController.markAsRead);

router.delete("/:notificationId", authenticate, notificationController.deleteNotification);

module.exports = router;
