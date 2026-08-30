"use strict";

const path = require("path");
// Configure dotenv to load from .env.test before importing app or config
require("dotenv").config({ path: path.join(__dirname, "../.env.test") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const models = require("../src/models");

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

let server;
const testResults = [];
const env = {
  baseUrl: BASE_URL,
  adminToken: null,
  userToken: null,
  reviewerToken: null,
  adminId: null,
  userAId: null,
  userBId: null,
  projectAId: null,
  projectBId: null,
  fileAId: null,
  fileBId: null,
  analysisAId: null,
  reportAId: null,
  notificationId: null,
};

let bugsFound = 0;
let bugsFixed = 0;

// Helper to print results nicely
function logTest(testId, name, method, url, requestBody, responseStatus, responseBody, result, notes = "") {
  testResults.push({
    testId,
    name,
    method,
    url,
    requestBody,
    responseStatus,
    responseBody,
    result,
    notes,
  });
  console.log(`[${result}] Test ${testId}: ${name} (${method} ${url.replace(BASE_URL, "/api")}) -> Status: ${responseStatus}`);
  if (result === "FAILED") {
    console.error("  Response Body:", JSON.stringify(responseBody, null, 2));
  }
}

async function runTests() {
  console.log("=== PS117 BACKEND MANUAL/INTEGRATION TEST RUNNER ===");

  try {
    // 1. Connect to Database
    console.log("Connecting to Mongo Test DB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database:", mongoose.connection.name);

    // 2. Clear Database
    console.log("Cleaning database collections...");
    for (const modelName of Object.keys(models)) {
      if (models[modelName].deleteMany) {
        await models[modelName].deleteMany({});
      }
    }
    console.log("Database cleared.");

    // 3. Seed initial ADMIN
    console.log("Seeding initial ADMIN user...");
    const adminPasswordHash = await bcrypt.hash("EMP001@Change123", 12);
    const adminUser = await models.User.create({
      employeeId: "EMP001",
      name: "System Admin",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      department: "Management",
      isActive: true,
      isFirstLogin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    env.adminId = adminUser._id.toString();
    console.log(`Admin seeded. ID: ${env.adminId}`);

    // 4. Start Server
    server = app.listen(PORT, () => {
      console.log(`Test server started on port ${PORT}`);
    });

  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }

  // --- API TEST REQUESTS ---

  // Test 4.1 — Admin Login (First Login)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "EMP001@Change123",
      }),
    });
    const status = res.status;
    const body = await res.json();
    
    if (status === 200 && body.success === true && body.data.token && body.data.user.isFirstLogin === true) {
      env.adminToken = body.data.token;
      logTest("4.1", "Admin Login (First Login)", "POST", `${BASE_URL}/auth/login`, { email: "admin@example.com" }, status, body, "PASSED");
    } else {
      logTest("4.1", "Admin Login (First Login)", "POST", `${BASE_URL}/auth/login`, { email: "admin@example.com" }, status, body, "FAILED");
    }
  } catch (err) {
    logTest("4.1", "Admin Login (First Login)", "POST", `${BASE_URL}/auth/login`, null, 0, err.message, "FAILED");
  }

  // Test 4.2 — Force Password Change
  try {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.adminToken}`,
      },
      body: JSON.stringify({
        currentPassword: "EMP001@Change123",
        newPassword: "SystemAdmin@2026",
        confirmPassword: "SystemAdmin@2026",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data === null) {
      logTest("4.2", "Force Password Change", "POST", `${BASE_URL}/auth/change-password`, null, status, body, "PASSED");
    } else {
      logTest("4.2", "Force Password Change", "POST", `${BASE_URL}/auth/change-password`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("4.2", "Force Password Change", "POST", `${BASE_URL}/auth/change-password`, null, 0, err.message, "FAILED");
  }

  // Test 4.3 — Login with New Password
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "SystemAdmin@2026",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.token && body.data.user.isFirstLogin === false) {
      env.adminToken = body.data.token; // Update token
      logTest("4.3", "Login with New Password", "POST", `${BASE_URL}/auth/login`, { email: "admin@example.com" }, status, body, "PASSED");
    } else {
      logTest("4.3", "Login with New Password", "POST", `${BASE_URL}/auth/login`, { email: "admin@example.com" }, status, body, "FAILED");
    }
  } catch (err) {
    logTest("4.3", "Login with New Password", "POST", `${BASE_URL}/auth/login`, null, 0, err.message, "FAILED");
  }

  // Test 4.4 — Forgot Password Token Request
  try {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true) {
      logTest("4.4", "Forgot Password Token Request", "POST", `${BASE_URL}/auth/forgot-password`, { email: "admin@example.com" }, status, body, "PASSED");
    } else {
      logTest("4.4", "Forgot Password Token Request", "POST", `${BASE_URL}/auth/forgot-password`, { email: "admin@example.com" }, status, body, "FAILED");
    }
  } catch (err) {
    logTest("4.4", "Forgot Password Token Request", "POST", `${BASE_URL}/auth/forgot-password`, null, 0, err.message, "FAILED");
  }

  // Test 5.1 — Create User A (Employee Role)
  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.adminToken}`,
      },
      body: JSON.stringify({
        employeeId: "EMP002",
        name: "Jane Employee",
        email: "employee@example.com",
        department: "Engineering",
        role: "EMPLOYEE",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 201 && body.success === true && body.data._id) {
      env.userAId = body.data._id;
      logTest("5.1", "Create User A (Employee)", "POST", `${BASE_URL}/users`, { employeeId: "EMP002" }, status, body, "PASSED");
    } else {
      logTest("5.1", "Create User A (Employee)", "POST", `${BASE_URL}/users`, { employeeId: "EMP002" }, status, body, "FAILED");
    }
  } catch (err) {
    logTest("5.1", "Create User A (Employee)", "POST", `${BASE_URL}/users`, null, 0, err.message, "FAILED");
  }

  // Test 5.2 — Create User B (Supervisor Role)
  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.adminToken}`,
      },
      body: JSON.stringify({
        employeeId: "EMP003",
        name: "Bob Supervisor",
        email: "supervisor@example.com",
        department: "Quality Assurance",
        role: "SUPERVISOR",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 201 && body.success === true && body.data._id) {
      env.userBId = body.data._id;
      logTest("5.2", "Create User B (Supervisor)", "POST", `${BASE_URL}/users`, { employeeId: "EMP003" }, status, body, "PASSED");
    } else {
      logTest("5.2", "Create User B (Supervisor)", "POST", `${BASE_URL}/users`, { employeeId: "EMP003" }, status, body, "FAILED");
    }
  } catch (err) {
    logTest("5.2", "Create User B (Supervisor)", "POST", `${BASE_URL}/users`, null, 0, err.message, "FAILED");
  }

  // Test 5.3 — Get All Users (Filtered)
  try {
    const res = await fetch(`${BASE_URL}/users?role=EMPLOYEE&isActive=true`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.adminToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && Array.isArray(body.data.users)) {
      logTest("5.3", "Get All Users (Filtered)", "GET", `${BASE_URL}/users`, null, status, body, "PASSED");
    } else {
      logTest("5.3", "Get All Users (Filtered)", "GET", `${BASE_URL}/users`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("5.3", "Get All Users (Filtered)", "GET", `${BASE_URL}/users`, null, 0, err.message, "FAILED");
  }

  // Test 5.4 — Change User A Password to Get Permanent Token
  try {
    // Login with temp password
    let loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "employee@example.com", password: "EMP002@Change123" }),
    });
    let loginBody = await loginRes.json();
    let tempToken = loginBody.data.token;

    // Change password
    let changeRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tempToken}`,
      },
      body: JSON.stringify({
        currentPassword: "EMP002@Change123",
        newPassword: "JaneEmployee@2026",
        confirmPassword: "JaneEmployee@2026",
      }),
    });
    await changeRes.json();

    // Login with permanent password
    let permRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "employee@example.com", password: "JaneEmployee@2026" }),
    });
    let permStatus = permRes.status;
    let permBody = await permRes.json();

    if (permStatus === 200 && permBody.success === true && permBody.data.token) {
      env.userToken = permBody.data.token;
      logTest("5.4", "Change User A Password & Login", "POST", `${BASE_URL}/auth/login`, null, permStatus, permBody, "PASSED");
    } else {
      logTest("5.4", "Change User A Password & Login", "POST", `${BASE_URL}/auth/login`, null, permStatus, permBody, "FAILED");
    }
  } catch (err) {
    logTest("5.4", "Change User A Password & Login", "POST", `${BASE_URL}/auth/login`, null, 0, err.message, "FAILED");
  }

  // Test 5.5 — Change User B Password to Get Permanent Token
  try {
    // Login with temp password
    let loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "supervisor@example.com", password: "EMP003@Change123" }),
    });
    let loginBody = await loginRes.json();
    let tempToken = loginBody.data.token;

    // Change password
    let changeRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tempToken}`,
      },
      body: JSON.stringify({
        currentPassword: "EMP003@Change123",
        newPassword: "BobSupervisor@2026",
        confirmPassword: "BobSupervisor@2026",
      }),
    });
    await changeRes.json();

    // Login with permanent password
    let permRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "supervisor@example.com", password: "BobSupervisor@2026" }),
    });
    let permStatus = permRes.status;
    let permBody = await permRes.json();

    if (permStatus === 200 && permBody.success === true && permBody.data.token) {
      env.reviewerToken = permBody.data.token;
      logTest("5.5", "Change User B Password & Login", "POST", `${BASE_URL}/auth/login`, null, permStatus, permBody, "PASSED");
    } else {
      logTest("5.5", "Change User B Password & Login", "POST", `${BASE_URL}/auth/login`, null, permStatus, permBody, "FAILED");
    }
  } catch (err) {
    logTest("5.5", "Change User B Password & Login", "POST", `${BASE_URL}/auth/login`, null, 0, err.message, "FAILED");
  }

  // Test 6.1 — Create Project A (By Employee User A)
  try {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.userToken}`,
      },
      body: JSON.stringify({
        name: "Project Alpha",
        description: "Confidential AI analysis regarding data sovereignty.",
        department: "Engineering",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 201 && body.success === true && body.data._id) {
      env.projectAId = body.data._id;
      logTest("6.1", "Create Project A", "POST", `${BASE_URL}/projects`, { name: "Project Alpha" }, status, body, "PASSED");
    } else {
      logTest("6.1", "Create Project A", "POST", `${BASE_URL}/projects`, { name: "Project Alpha" }, status, body, "FAILED");
    }
  } catch (err) {
    logTest("6.1", "Create Project A", "POST", `${BASE_URL}/projects`, null, 0, err.message, "FAILED");
  }

  // Programmatic DB Seeding of Project Membership for User A (Owner)
  try {
    await models.ProjectMember.create({
      projectId: env.projectAId,
      userId: env.userAId,
      role: "OWNER",
      addedBy: env.userAId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`[INFO] Programmatically seeded project membership for User A as OWNER of Project A`);
  } catch (dbErr) {
    console.error("[ERROR] Failed to seed project membership:", dbErr);
  }

  // Test 6.2 — Add User B as Project Reviewer (By Owner User A)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.userToken}`,
      },
      body: JSON.stringify({
        userId: env.userBId,
        role: "REVIEWER",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 201 && body.success === true && body.data.role === "REVIEWER") {
      logTest("6.2", "Add User B as Project Reviewer", "POST", `${BASE_URL}/projects/${env.projectAId}/members`, null, status, body, "PASSED");
    } else {
      logTest("6.2", "Add User B as Project Reviewer", "POST", `${BASE_URL}/projects/${env.projectAId}/members`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("6.2", "Add User B as Project Reviewer", "POST", `${BASE_URL}/projects/${env.projectAId}/members`, null, 0, err.message, "FAILED");
  }

  // Test 6.3 — Get Project Members
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/members`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.userToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && Array.isArray(body.data) && body.data.length === 2) {
      logTest("6.3", "Get Project Members", "GET", `${BASE_URL}/projects/${env.projectAId}/members`, null, status, body, "PASSED");
    } else {
      logTest("6.3", "Get Project Members", "GET", `${BASE_URL}/projects/${env.projectAId}/members`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("6.3", "Get Project Members", "GET", `${BASE_URL}/projects/${env.projectAId}/members`, null, 0, err.message, "FAILED");
  }

  // Test 7.1 — Register File Metadata (By User A)
  try {
    const formData = new FormData();
    const testFileContent = "test file content for sovereignty guidelines";
    formData.append(
      "file",
      new Blob([testFileContent], { type: "application/pdf" }),
      "sovereignty_guidelines.pdf"
    );
    formData.append("classification", "CONFIDENTIAL");

    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/files`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.userToken}`,
      },
      body: formData,
    });
    const status = res.status;
    const body = await res.json();

    if (status === 201 && body.success === true && body.data._id) {
      env.fileAId = body.data._id;
      logTest("7.1", "Register File Metadata", "POST", `${BASE_URL}/projects/${env.projectAId}/files`, null, status, body, "PASSED");
    } else {
      logTest("7.1", "Register File Metadata", "POST", `${BASE_URL}/projects/${env.projectAId}/files`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("7.1", "Register File Metadata", "POST", `${BASE_URL}/projects/${env.projectAId}/files`, null, 0, err.message, "FAILED");
  }

  // Test 7.2 — Set File Status to READY (Requires ADMIN Token)
  try {
    const res = await fetch(`${BASE_URL}/files/${env.fileAId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.adminToken}`,
      },
      body: JSON.stringify({
        status: "READY",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.status === "READY") {
      logTest("7.2", "Set File Status to READY (Admin)", "PATCH", `${BASE_URL}/files/${env.fileAId}/status`, null, status, body, "PASSED");
    } else {
      logTest("7.2", "Set File Status to READY (Admin)", "PATCH", `${BASE_URL}/files/${env.fileAId}/status`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("7.2", "Set File Status to READY (Admin)", "PATCH", `${BASE_URL}/files/${env.fileAId}/status`, null, 0, err.message, "FAILED");
  }

  // Test 7.3 — Get Project Files
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/files`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.userToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.files[0].status === "READY") {
      logTest("7.3", "Get Project Files", "GET", `${BASE_URL}/projects/${env.projectAId}/files`, null, status, body, "PASSED");
    } else {
      logTest("7.3", "Get Project Files", "GET", `${BASE_URL}/projects/${env.projectAId}/files`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("7.3", "Get Project Files", "GET", `${BASE_URL}/projects/${env.projectAId}/files`, null, 0, err.message, "FAILED");
  }

  // Test 8.1 — Create Analysis (By User A)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/analyses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.userToken}`,
      },
      body: JSON.stringify({
        type: "DOCUMENT",
        instruction: "Analyze the document for personal identifiable information (PII) leakage.",
        inputFiles: [env.fileAId],
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 201 && body.success === true && body.data._id) {
      env.analysisAId = body.data._id;
      logTest("8.1", "Create Analysis", "POST", `${BASE_URL}/projects/${env.projectAId}/analyses`, null, status, body, "PASSED");
    } else {
      logTest("8.1", "Create Analysis", "POST", `${BASE_URL}/projects/${env.projectAId}/analyses`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("8.1", "Create Analysis", "POST", `${BASE_URL}/projects/${env.projectAId}/analyses`, null, 0, err.message, "FAILED");
  }

  // Test 8.2 — Set Analysis Status to COMPLETED (Requires ADMIN Token)
  try {
    const res = await fetch(`${BASE_URL}/analyses/${env.analysisAId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.adminToken}`,
      },
      body: JSON.stringify({
        status: "COMPLETED",
        result: {
          piiDetected: false,
          complianceScore: 100,
          details: "No PII elements found. Storage parameters comply with sovereignty mandates.",
        },
        agentPlan: {
          stepsRun: ["ocr_scan", "regex_pii_check", "sovereignty_region_match"],
        },
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.status === "COMPLETED") {
      logTest("8.2", "Set Analysis Status to COMPLETED (Admin)", "PATCH", `${BASE_URL}/analyses/${env.analysisAId}/status`, null, status, body, "PASSED");
    } else {
      logTest("8.2", "Set Analysis Status to COMPLETED (Admin)", "PATCH", `${BASE_URL}/analyses/${env.analysisAId}/status`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("8.2", "Set Analysis Status to COMPLETED (Admin)", "PATCH", `${BASE_URL}/analyses/${env.analysisAId}/status`, null, 0, err.message, "FAILED");
  }

  // Test 9.1 — Create Report Draft (By User A)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.userToken}`,
      },
      body: JSON.stringify({
        analysisId: env.analysisAId,
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
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 201 && body.success === true && body.data._id) {
      env.reportAId = body.data._id;
      logTest("9.1", "Create Report Draft", "POST", `${BASE_URL}/projects/${env.projectAId}/reports`, null, status, body, "PASSED");
    } else {
      logTest("9.1", "Create Report Draft", "POST", `${BASE_URL}/projects/${env.projectAId}/reports`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("9.1", "Create Report Draft", "POST", `${BASE_URL}/projects/${env.projectAId}/reports`, null, 0, err.message, "FAILED");
  }

  // Test 9.2 — Submit Report for Review (By User A)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/submit`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.userToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.status === "PENDING_REVIEW") {
      logTest("9.2", "Submit Report for Review", "POST", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/submit`, null, status, body, "PASSED");
    } else {
      logTest("9.2", "Submit Report for Review", "POST", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/submit`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("9.2", "Submit Report for Review", "POST", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/submit`, null, 0, err.message, "FAILED");
  }

  // Test 9.3 — Approve Report (By Supervisor User B / Project Reviewer)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.reviewerToken}`,
      },
      body: JSON.stringify({
        status: "APPROVED",
        reviewComment: "I have reviewed the analysis findings and approve this report.",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.status === "APPROVED") {
      logTest("9.3", "Approve Report", "POST", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/approve`, null, status, body, "PASSED");
    } else {
      logTest("9.3", "Approve Report", "POST", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/approve`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("9.3", "Approve Report", "POST", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}/approve`, null, 0, err.message, "FAILED");
  }

  // Programmatically seed notification for User B so we can test the notification routes
  try {
    const seededNotification = await models.Notification.create({
      userId: env.userBId,
      type: "SYSTEM",
      message: "Jane Employee submitted a report for review.",
      resourceType: "Report",
      resourceId: env.reportAId,
      isRead: false,
    });
    console.log(`[INFO] Programmatically seeded notification for User B. ID: ${seededNotification._id}`);
  } catch (err) {
    console.error("[ERROR] Failed to seed notification:", err);
  }

  // Test 10.1 — Fetch Notifications (By User B)
  try {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.reviewerToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.notifications.length > 0) {
      env.notificationId = body.data.notifications[0]._id;
      logTest("10.1", "Fetch Notifications", "GET", `${BASE_URL}/notifications`, null, status, body, "PASSED");
    } else {
      logTest("10.1", "Fetch Notifications", "GET", `${BASE_URL}/notifications`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("10.1", "Fetch Notifications", "GET", `${BASE_URL}/notifications`, null, 0, err.message, "FAILED");
  }

  // Test 10.2 — Mark Notification as Read
  try {
    const res = await fetch(`${BASE_URL}/notifications/${env.notificationId}/read`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${env.reviewerToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && body.data.isRead === true) {
      logTest("10.2", "Mark Notification as Read", "PATCH", `${BASE_URL}/notifications/${env.notificationId}/read`, null, status, body, "PASSED");
    } else {
      logTest("10.2", "Mark Notification as Read", "PATCH", `${BASE_URL}/notifications/${env.notificationId}/read`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("10.2", "Mark Notification as Read", "PATCH", `${BASE_URL}/notifications/${env.notificationId}/read`, null, 0, err.message, "FAILED");
  }

  // Test 10.3 — Get Global Audit Logs (Requires ADMIN Token)
  try {
    const res = await fetch(`${BASE_URL}/audit`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.adminToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && Array.isArray(body.data.logs)) {
      logTest("10.3", "Get Global Audit Logs (Admin)", "GET", `${BASE_URL}/audit`, null, status, body, "PASSED");
    } else {
      logTest("10.3", "Get Global Audit Logs (Admin)", "GET", `${BASE_URL}/audit`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("10.3", "Get Global Audit Logs (Admin)", "GET", `${BASE_URL}/audit`, null, 0, err.message, "FAILED");
  }

  // Test 10.4 — Get Project Specific Audit Activities (Requires ADMIN Token)
  try {
    const res = await fetch(`${BASE_URL}/audit/projects/${env.projectAId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.adminToken}`,
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 200 && body.success === true && Array.isArray(body.data.logs)) {
      logTest("10.4", "Get Project Specific Audit Activities (Admin)", "GET", `${BASE_URL}/audit/projects/${env.projectAId}`, null, status, body, "PASSED");
    } else {
      logTest("10.4", "Get Project Specific Audit Activities (Admin)", "GET", `${BASE_URL}/audit/projects/${env.projectAId}`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("10.4", "Get Project Specific Audit Activities (Admin)", "GET", `${BASE_URL}/audit/projects/${env.projectAId}`, null, 0, err.message, "FAILED");
  }

  // Setup for Section 11 (Cross-Project & Authorization Failures)
  // Create Project B (Beta) owned by Admin
  try {
    const res = await models.Project.create({
      name: "Project Beta",
      description: "Admin restricted project.",
      department: "Management",
      createdBy: env.adminId,
      status: "ACTIVE",
    });
    env.projectBId = res._id.toString();
    console.log(`[INFO] Seeded Project Beta. ID: ${env.projectBId}`);
  } catch (dbErr) {
    console.error("[ERROR] Failed to seed Project Beta:", dbErr);
  }

  // Test 11.1 — Access Project Without Membership (Should Fail)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectBId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.userToken}`, // User A tries to access Project Beta
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 403 && body.success === false && body.message === "Forbidden") {
      logTest("11.1", "Access Project Without Membership (User A -> Project Beta)", "GET", `${BASE_URL}/projects/${env.projectBId}`, null, status, body, "PASSED");
    } else {
      logTest("11.1", "Access Project Without Membership (User A -> Project Beta)", "GET", `${BASE_URL}/projects/${env.projectBId}`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("11.1", "Access Project Without Membership (User A -> Project Beta)", "GET", `${BASE_URL}/projects/${env.projectBId}`, null, 0, err.message, "FAILED");
  }

  // Test 11.2 — Cross-Project Resource Query (Should Fail)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectBId}/files/${env.fileAId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.userToken}`, // User A tries to query File A inside Project B
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 403 && body.success === false && body.message === "Forbidden") {
      logTest("11.2", "Cross-Project Resource Query (File A in Project B context)", "GET", `${BASE_URL}/projects/${env.projectBId}/files/${env.fileAId}`, null, status, body, "PASSED");
    } else {
      logTest("11.2", "Cross-Project Resource Query (File A in Project B context)", "GET", `${BASE_URL}/projects/${env.projectBId}/files/${env.fileAId}`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("11.2", "Cross-Project Resource Query (File A in Project B context)", "GET", `${BASE_URL}/projects/${env.projectBId}/files/${env.fileAId}`, null, 0, err.message, "FAILED");
  }

  // Test 11.3 — Non-Admin Accessing User Management (Should Fail)
  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.userToken}`, // User A (Employee) tries to access User List
      },
    });
    const status = res.status;
    const body = await res.json();

    if (status === 403 && body.success === false && body.message === "Forbidden") {
      logTest("11.3", "Non-Admin Accessing User Management (Employee -> /users)", "GET", `${BASE_URL}/users`, null, status, body, "PASSED");
    } else {
      logTest("11.3", "Non-Admin Accessing User Management (Employee -> /users)", "GET", `${BASE_URL}/users`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("11.3", "Non-Admin Accessing User Management (Employee -> /users)", "GET", `${BASE_URL}/users`, null, 0, err.message, "FAILED");
  }

  // Test 11.4 — Modify Approved Report (Should Fail)
  try {
    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.userToken}`, // User A tries to edit approved Report A
      },
      body: JSON.stringify({
        title: "Malicious Modification Request",
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 400 && body.success === false && body.message === "Only draft reports can be updated") {
      logTest("11.4", "Modify Approved Report (Edit after approved)", "PATCH", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}`, null, status, body, "PASSED");
    } else {
      logTest("11.4", "Modify Approved Report (Edit after approved)", "PATCH", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("11.4", "Modify Approved Report (Edit after approved)", "PATCH", `${BASE_URL}/projects/${env.projectAId}/reports/${env.reportAId}`, null, 0, err.message, "FAILED");
  }

  // Test 11.5 — Analysis Creation with Invalid Cross-Project File (Should Fail)
  try {
    // Register File B under Project B
    const fileB = await models.File.create({
      projectId: env.projectBId,
      uploadedBy: env.adminId,
      filename: "secret_b.pdf",
      originalName: "secret_b.pdf",
      mimeType: "application/pdf",
      size: 500,
      storageKey: "uploads/project_beta/secret_b.pdf",
      status: "READY",
      classification: "INTERNAL",
    });
    env.fileBId = fileB._id.toString();
    console.log(`[INFO] Seeded File B inside Project Beta. ID: ${env.fileBId}`);

    const res = await fetch(`${BASE_URL}/projects/${env.projectAId}/analyses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.userToken}`, // User A tries to run analysis in Project A using File B
      },
      body: JSON.stringify({
        type: "GENERAL",
        inputFiles: [env.fileBId],
      }),
    });
    const status = res.status;
    const body = await res.json();

    if (status === 400 && body.success === false && body.message === "One or more input files are invalid or do not belong to this project") {
      logTest("11.5", "Analysis Creation with File Belonging to Another Project", "POST", `${BASE_URL}/projects/${env.projectAId}/analyses`, null, status, body, "PASSED");
    } else {
      logTest("11.5", "Analysis Creation with File Belonging to Another Project", "POST", `${BASE_URL}/projects/${env.projectAId}/analyses`, null, status, body, "FAILED");
    }
  } catch (err) {
    logTest("11.5", "Analysis Creation with File Belonging to Another Project", "POST", `${BASE_URL}/projects/${env.projectAId}/analyses`, null, 0, err.message, "FAILED");
  }


  // --- TEST REPORT SUMMARY ---
  console.log("\n=== TEST RUNNER SUMMARY ===");
  const total = testResults.length;
  const passed = testResults.filter(t => t.result === "PASSED").length;
  const failed = testResults.filter(t => t.result === "FAILED").length;
  console.log(`Total Requests executed: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nFailed Tests:");
    testResults.filter(t => t.result === "FAILED").forEach(t => {
      console.log(`- Test ${t.testId}: ${t.name} (${t.method} ${t.url}) -> Status: ${t.responseStatus}`);
      console.log("  Error/Body:", t.notes || JSON.stringify(t.responseBody, null, 2));
    });
  }

  // Tear Down
  console.log("Shutting down test server and disconnecting database...");
  server.close();
  await mongoose.disconnect();
  console.log("Done.");

  // Exit code based on failures
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
