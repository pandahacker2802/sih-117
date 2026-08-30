"use strict";

const path = require("path");
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
require("dotenv").config({ path: path.join(__dirname, "..", envFile) });
const fs = require("fs");
const mongoose = require("mongoose");
const { Analysis, File, User, Project } = require("./models");
const analysisWorker = require("./services/ai/analysisWorker");

async function runTest() {
  console.log("=== Starting Worker E2E Test ===");
  
  // 1. Connect to DB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  // Start the background worker for the test
  analysisWorker.start();

  // Retrieve seed data
  const user = await User.findOne({ email: "admin@example.com" });
  const project = await Project.findOne({ name: "Project Alpha" });
  const file = await File.findOne({ filename: "sovereignty_guidelines.pdf" });

  if (!user || !project || !file) {
    console.error("Missing seeded seed data! Run 'node src/seed.js' first.");
    process.exit(1);
  }

  console.log(`Using User: ${user.name} (${user.role})`);
  console.log(`Using Project: ${project.name} (${project._id})`);
  console.log(`Using File: ${file.filename} (${file._id})`);

  // Clear previous test analyses
  await Analysis.deleteMany({ instruction: /E2E Worker Test/ });

  // ----------------------------------------------------
  // TEST 1: Physical File Unavailable (Expected Failure)
  // ----------------------------------------------------
  console.log("\n--- TEST 1: Expecting Failure (File Unavailable) ---");
  
  // Ensure the physical file does NOT exist
  const physicalPath = path.resolve(process.cwd(), file.storageKey);
  if (fs.existsSync(physicalPath)) {
    fs.unlinkSync(physicalPath);
  }
  
  console.log("Creating a QUEUED analysis...");
  const analysis1 = await Analysis.create({
    projectId: project._id,
    createdBy: user._id,
    type: "DOCUMENT",
    instruction: "E2E Worker Test - Expecting Failure",
    inputFiles: [file._id],
    status: "QUEUED",
  });

  console.log(`Analysis queued. ID: ${analysis1._id}. Waiting 7 seconds for worker poll...`);
  await new Promise((resolve) => setTimeout(resolve, 7000));

  // Re-fetch analysis1
  const result1 = await Analysis.findById(analysis1._id);
  console.log("Updated status:", result1.status);
  console.log("Error message:", result1.error?.message || result1.error);

  if (result1.status === "FAILED" && (result1.error?.message === "physical file unavailable" || result1.error === "physical file unavailable")) {
    console.log("✅ TEST 1 PASSED: Worker correctly failed the task when the file was missing.");
  } else {
    console.error("❌ TEST 1 FAILED: Expected FAILED status with 'physical file unavailable' error.");
  }

  // ----------------------------------------------------
  // TEST 2: Physical File Available (Expected Success)
  // ----------------------------------------------------
  console.log("\n--- TEST 2: Expecting Success (File Available) ---");

  // Create the physical directory and dummy file
  const dirPath = path.dirname(physicalPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(physicalPath, "Dummy PDF content for compliance check");
  console.log(`Created dummy file at: ${physicalPath}`);

  console.log("Creating a new QUEUED analysis...");
  const analysis2 = await Analysis.create({
    projectId: project._id,
    createdBy: user._id,
    type: "DOCUMENT",
    instruction: "E2E Worker Test - Expecting Success",
    inputFiles: [file._id],
    status: "QUEUED",
  });

  console.log(`Analysis queued. ID: ${analysis2._id}. Waiting 7 seconds for worker poll...`);
  await new Promise((resolve) => setTimeout(resolve, 7000));

  // Re-fetch analysis2
  const result2 = await Analysis.findById(analysis2._id);
  console.log("Updated status:", result2.status);
  console.log("Result details:", result2.result?.details);
  console.log("Steps run:", result2.agentPlan?.stepsRun);

  if (result2.status === "COMPLETED" && result2.result?.details.includes("[STUB] Analysis completed successfully")) {
    console.log("✅ TEST 2 PASSED: Worker correctly completed the task using the AI adapter bridge.");
  } else {
    console.error("❌ TEST 2 FAILED: Expected COMPLETED status with adapter results.");
  }

  // Clean up dummy file
  if (fs.existsSync(physicalPath)) {
    fs.unlinkSync(physicalPath);
  }
  console.log("\nCleaned up dummy file.");
  
  analysisWorker.stop();
  await mongoose.connection.close();
  console.log("=== Worker E2E Test Completed ===");
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  mongoose.connection.close();
  process.exit(1);
});
