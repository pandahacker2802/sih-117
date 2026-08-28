/**
 * Centralized API client for communicating with the PS117 backend.
 * Uses native fetch — no extra dependencies required.
 *
 * Every request automatically attaches the JWT from localStorage
 * and returns the parsed JSON body (or throws a structured error).
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  login: (email, password) => api.post("/auth/login", { email, password }),
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
  list: () => api.get("/projects"),
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
  list: (projectId) => api.get(`/projects/${projectId}/files`),
  register: (projectId, body) => api.post(`/projects/${projectId}/files`, body),
};

// Analyses (project-scoped)
export const analysesAPI = {
  list: (projectId) => api.get(`/projects/${projectId}/analyses`),
  getById: (projectId, analysisId) => api.get(`/projects/${projectId}/analyses/${analysisId}`),
  create: (projectId, body) => api.post(`/projects/${projectId}/analyses`, body),
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
