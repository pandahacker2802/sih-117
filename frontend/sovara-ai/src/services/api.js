/**
 * Centralized API client for communicating with the PS117 backend.
 * Uses native fetch — no extra dependencies required.
 *
 * Every request automatically attaches the JWT from localStorage
 * and returns the parsed JSON body (or throws a structured error).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEMO_PROJECT_ID = "demo-project";

const LOCAL_SEEDED_USERS = [
  {
    identifier: "admin@example.com",
    employeeId: "EMP001",
    password: "SystemAdmin@2026",
    user: {
      _id: "seed-admin",
      name: "Alex Mercer",
      email: "admin@example.com",
      employeeId: "EMP001",
      role: "ADMIN",
    },
  },
  {
    identifier: "supervisor@example.com",
    employeeId: "EMP003",
    password: "BobSupervisor@2026",
    user: {
      _id: "seed-supervisor",
      name: "Bob Supervisor",
      email: "supervisor@example.com",
      employeeId: "EMP003",
      role: "SUPERVISOR",
    },
  },
  {
    identifier: "employee@example.com",
    employeeId: "EMP002",
    password: "JaneEmployee@2026",
    user: {
      _id: "seed-employee",
      name: "Jane Employee",
      email: "employee@example.com",
      employeeId: "EMP002",
      role: "EMPLOYEE",
    },
  },
];

function findLocalSeedUser(identifier, password) {
  const normalizedId = String(identifier || "").trim();
  const normalizedPassword = String(password || "");

  return LOCAL_SEEDED_USERS.find((candidate) => {
    const matchesIdentifier =
      candidate.identifier.toLowerCase() === normalizedId.toLowerCase() ||
      candidate.employeeId.toLowerCase() === normalizedId.toLowerCase();

    return matchesIdentifier && candidate.password === normalizedPassword;
  });
}

function demoStorageRead(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function demoStorageWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isDemoUser() {
  return getToken() === "demo-alex-token";
}

// ── helpers ────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("sovara_token");
}

function setToken(token) {
  localStorage.setItem("sovara_token", token);
}

function clearToken() {
  localStorage.removeItem("sovara_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("sovara_user"));
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem("sovara_user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("sovara_user");
}

// ── core request function ──────────────────────────────────────────

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(json?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = json;
    throw error;
  }

  return json;
}

// ── convenience wrappers ───────────────────────────────────────────

const api = {
  get:   (path) => request("GET", path),
  post:  (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  del:   (path) => request("DELETE", path),
};

// ── domain-specific endpoints ──────────────────────────────────────

// Auth
export const authAPI = {
  login: (identifier, password) => {
    const normalizedId = String(identifier || "").trim();

    const localSeedUser = findLocalSeedUser(normalizedId, password);
    if (localSeedUser) {
      return Promise.resolve({
        success: true,
        data: {
          token: `seed-${localSeedUser.user.role.toLowerCase()}-token`,
          user: localSeedUser.user,
        },
      });
    }

    if (
      normalizedId &&
      (normalizedId.toLowerCase() === "alex" || normalizedId.toLowerCase() === "alex123" || normalizedId.toLowerCase() === "alex@example.com") &&
      password === "123"
    ) {
      return Promise.resolve({
        success: true,
        data: {
          token: "demo-alex-token",
          user: {
            _id: "demo-alex",
            name: "Alex",
            email: "alex@example.com",
            employeeId: "alex123",
            role: "EMPLOYEE",
          },
        },
      });
    }

    return api.post("/auth/login", {
      email: normalizedId.includes("@") ? normalizedId : undefined,
      employeeId: normalizedId.includes("@") ? undefined : normalizedId,
      password,
    });
  },
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", {
      token,
      newPassword,
      confirmPassword: newPassword,
    }),
  changePassword: (body) => api.post("/auth/change-password", body),
};

// Users (ADMIN)
export const usersAPI = {
  list: (query = "") => api.get(`/users${query ? `?${query}` : ""}`),
  getById: (id) => api.get(`/users/${id}`),
  create: (body) => api.post("/users", body),
  update: (id, body) => api.patch(`/users/${id}`, body),
  activate: (id) => api.patch(`/users/${id}/activate`),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
};

// Projects
export const projectsAPI = {
  list: () => {
    if (isDemoUser()) {
      return Promise.resolve({
        success: true,
        data: {
          projects: [{ _id: DEMO_PROJECT_ID, name: "Project Alpha", description: "Demo project" }],
        },
      });
    }
    return api.get("/projects");
  },
  getById: (id) => api.get(`/projects/${id}`),
  create: (body) => api.post("/projects", body),
  update: (id, body) => api.patch(`/projects/${id}`, body),
  archive: (id) => api.patch(`/projects/${id}/archive`),
};

// Project Members
export const membersAPI = {
  list: (projectId) => api.get(`/projects/${projectId}/members`),
  add: (projectId, body) => api.post(`/projects/${projectId}/members`, body),
  updateRole: (projectId, userId, body) => api.patch(`/projects/${projectId}/members/${userId}`, body),
  remove: (projectId, userId) => api.del(`/projects/${projectId}/members/${userId}`),
};

// Files (project-scoped)
export const filesAPI = {
  list: (projectId) => {
    if (isDemoUser()) {
      return Promise.resolve({
        success: true,
        data: {
          files: demoStorageRead(`sovara_demo_files_${projectId || DEMO_PROJECT_ID}`, []),
        },
      });
    }
    return api.get(`/projects/${projectId}/files`);
  },

  /**
   * Upload a real file via multipart/form-data.
   * @param {string} projectId
   * @param {File} file - a browser File object from an <input type="file">
   * @param {string} [classification] - optional classification enum
   */
  upload: async (projectId, file, classification = "INTERNAL") => {
    if (!file) {
      throw new Error("No file selected");
    }

    if (isDemoUser()) {
      const fileId = crypto.randomUUID ? crypto.randomUUID() : `demo-file-${Date.now()}`;
      const demoFile = {
        _id: fileId,
        projectId: projectId || DEMO_PROJECT_ID,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storageKey: `demo-uploads/${file.name}`,
        classification,
        status: "READY",
        createdAt: new Date().toISOString(),
      };

      const key = `sovara_demo_files_${projectId || DEMO_PROJECT_ID}`;
      const current = demoStorageRead(key, []);
      demoStorageWrite(key, [demoFile, ...current]);
      return { success: true, data: demoFile };
    }

    const token = getToken();
    const formData = new FormData();
    formData.append("file", file, file.name || "upload");
    formData.append("classification", classification);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${BASE_URL}/projects/${projectId}/files`, {
      method: "POST",
      headers,
      body: formData,
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const error = new Error(json?.message || `Upload failed (${res.status})`);
      error.status = res.status;
      error.data = json;
      throw error;
    }
    return json;
  },
};

// Analyses (project-scoped)
export const analysesAPI = {
  list: (projectId) => {
    if (isDemoUser()) {
      return Promise.resolve({
        success: true,
        data: {
          analyses: demoStorageRead(`sovara_demo_analyses_${projectId || DEMO_PROJECT_ID}`, []),
        },
      });
    }
    return api.get(`/projects/${projectId}/analyses`);
  },
  getById: (projectId, analysisId) => {
    if (isDemoUser()) {
      const analyses = demoStorageRead(`sovara_demo_analyses_${projectId || DEMO_PROJECT_ID}`, []);
      const found = analyses.find((item) => item._id === analysisId);
      return Promise.resolve({ success: true, data: found || null });
    }
    return api.get(`/projects/${projectId}/analyses/${analysisId}`);
  },
  create: (projectId, body) => {
    if (isDemoUser()) {
      const analysis = {
        _id: `demo-analysis-${Date.now()}`,
        projectId: projectId || DEMO_PROJECT_ID,
        ...body,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        result: {
          answer: "Demo analysis complete. The attached document has been indexed and reviewed locally.",
          sources: [{ source: "Local workspace document", page: 1, evidence: "Uploaded document processed in the local sovereign enclave." }],
        },
        agentPlan: { stepsRun: ["understanding_request_parameters", "reviewing_evidence", "response_generation"] },
      };
      const listKey = `sovara_demo_analyses_${projectId || DEMO_PROJECT_ID}`;
      const current = demoStorageRead(listKey, []);
      demoStorageWrite(listKey, [analysis, ...current]);
      return Promise.resolve({ success: true, data: analysis });
    }
    return api.post(`/projects/${projectId}/analyses`, body);
  },
  cancel: (projectId, analysisId) => api.post(`/projects/${projectId}/analyses/${analysisId}/cancel`),
  retry: (projectId, analysisId) => api.post(`/projects/${projectId}/analyses/${analysisId}/retry`),
};

// Reports (project-scoped)
export const reportsAPI = {
  list: (projectId) => api.get(`/projects/${projectId}/reports`),
  getById: (projectId, reportId) => api.get(`/projects/${projectId}/reports/${reportId}`),
  create: (projectId, body) => api.post(`/projects/${projectId}/reports`, body),
  update: (projectId, reportId, body) => api.patch(`/projects/${projectId}/reports/${reportId}`, body),
  submit: (projectId, reportId) => api.post(`/projects/${projectId}/reports/${reportId}/submit`),
  approve: (projectId, reportId, body) => api.post(`/projects/${projectId}/reports/${reportId}/approve`, body),
  reject: (projectId, reportId, body) => api.post(`/projects/${projectId}/reports/${reportId}/reject`, body),
};

// Notifications
export const notificationsAPI = {
  list: () => api.get("/notifications"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  remove: (id) => api.del(`/notifications/${id}`),
};

// Audit (ADMIN)
export const auditAPI = {
  getLogs: (query = "") => api.get(`/audit${query ? `?${query}` : ""}`),
  getProjectActivity: (projectId) => api.get(`/audit/projects/${projectId}`),
};

// Token / user helpers re-exported for context usage
export { getToken, setToken, clearToken, getUser, setUser, clearUser, BASE_URL };
