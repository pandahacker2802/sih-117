"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User, Project, ProjectMember, File, Analysis, Report, Notification, AuditLog } = require("./models");

const BCRYPT_ROUNDS = 12;

const seed = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

    // Clear existing database collections to have a fresh state
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Project.deleteMany({});
    await ProjectMember.deleteMany({});
    await File.deleteMany({});
    await Analysis.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log("Seeding users...");

    // 1. Admin User
    const adminPasswordHash = await bcrypt.hash("SystemAdmin@2026", BCRYPT_ROUNDS);
    const admin = await User.create({
      employeeId: "EMP001",
      name: "Alex Mercer",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      department: "Management",
      isActive: true,
      isFirstLogin: false,
    });

    // 2. Supervisor / Reviewer User
    const supervisorPasswordHash = await bcrypt.hash("BobSupervisor@2026", BCRYPT_ROUNDS);
    const supervisor = await User.create({
      employeeId: "EMP003",
      name: "Bob Supervisor",
      email: "supervisor@example.com",
      passwordHash: supervisorPasswordHash,
      role: "SUPERVISOR",
      department: "Quality Assurance",
      isActive: true,
      isFirstLogin: false,
    });

    // 3. Employee User
    const employeePasswordHash = await bcrypt.hash("JaneEmployee@2026", BCRYPT_ROUNDS);
    const employee = await User.create({
      employeeId: "EMP002",
      name: "Jane Employee",
      email: "employee@example.com",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      department: "Engineering",
      isActive: true,
      isFirstLogin: false,
    });

    console.log("Users seeded successfully!");
    console.log("- Admin: admin@example.com / SystemAdmin@2026");
    console.log("- Supervisor: supervisor@example.com / BobSupervisor@2026");
    console.log("- Employee: employee@example.com / JaneEmployee@2026");

    // Let's create a default Project for Jane Employee
    console.log("Seeding a default project...");
    const project = await Project.create({
      name: "Project Alpha",
      description: "Confidential AI analysis regarding data sovereignty and compliance.",
      department: "Engineering",
      createdBy: employee._id,
      status: "ACTIVE",
    });

    // Owner membership for Jane
    await ProjectMember.create({
      projectId: project._id,
      userId: employee._id,
      role: "OWNER",
      addedBy: employee._id,
    });

    // Reviewer membership for Bob
    await ProjectMember.create({
      projectId: project._id,
      userId: supervisor._id,
      role: "REVIEWER",
      addedBy: employee._id,
    });

    // Owner membership for Admin (so admin has access in frontend dev context)
    await ProjectMember.create({
      projectId: project._id,
      userId: admin._id,
      role: "OWNER",
      addedBy: employee._id,
    });

    console.log(`Default project 'Project Alpha' seeded. ID: ${project._id}`);

    // Seed file metadata
    console.log("Seeding a default file metadata...");
    const file = await File.create({
      projectId: project._id,
      uploadedBy: employee._id,
      filename: "sovereignty_guidelines.pdf",
      originalName: "sovereignty_guidelines.pdf",
      mimeType: "application/pdf",
      size: 2048500,
      storageKey: "uploads/project_alpha/sovereignty_guidelines.pdf",
      status: "READY",
      classification: "CONFIDENTIAL",
    });

    console.log(`Default file registered. ID: ${file._id}`);

    // Seed a default analysis
    console.log("Seeding a default analysis...");
    const analysis = await Analysis.create({
      projectId: project._id,
      createdBy: employee._id,
      type: "DOCUMENT",
      instruction: "Analyze the document for personal identifiable information (PII) leakage.",
      inputFiles: [file._id],
      status: "COMPLETED",
      result: {
        piiDetected: false,
        complianceScore: 100,
        details: "No PII elements found. Storage parameters comply with sovereignty mandates.",
      },
      agentPlan: {
        stepsRun: ["ocr_scan", "regex_pii_check", "sovereignty_region_match"],
      },
      startedAt: new Date(Date.now() - 5000),
      completedAt: new Date(),
    });

    console.log(`Default analysis seeded. ID: ${analysis._id}`);

    // Seed a default report
    console.log("Seeding a default report...");
    const report = await Report.create({
      projectId: project._id,
      analysisId: analysis._id,
      createdBy: employee._id,
      title: "Sovereignty Compliance Report - Alpha",
      summary: "Official compliance summary based on PII checking result.",
      findings: [
        {
          title: "PII Clearance",
          content: "No instances of emails, phone numbers, or passwords detected.",
          order: 1,
        },
      ],
      recommendations: [
        {
          title: "Regular Scanning",
          content: "Perform weekly sweeps of uploads.",
          order: 1,
        },
      ],
      status: "APPROVED",
      reviewComment: "I have reviewed the analysis findings and approve this report.",
      reviewedBy: supervisor._id,
      reviewedAt: new Date(),
    });

    console.log(`Default report seeded. ID: ${report._id}`);

    // Seed a notification for supervisor
    console.log("Seeding a default notification...");
    await Notification.create({
      userId: supervisor._id,
      type: "SYSTEM",
      message: "Jane Employee submitted a report for review.",
      resourceType: "Report",
      resourceId: report._id,
      isRead: false,
    });

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
