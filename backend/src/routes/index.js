"use strict";

const { Router } = require("express");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
const fileRoutes = require("./fileRoutes");
const analysisRoutes = require("./analysisRoutes");
const reportRoutes = require("./reportRoutes");
const notificationRoutes = require("./notificationRoutes");
const auditRoutes = require("./auditRoutes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/", fileRoutes);
router.use("/", analysisRoutes);
router.use("/", reportRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audit", auditRoutes);

module.exports = router;
