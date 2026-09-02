import { createContext, useContext, useEffect, useState } from "react";
import {
  authAPI,
  getToken,
  setToken,
  clearToken,
  getUser,
  setUser,
  clearUser,
  projectsAPI,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, _setUser] = useState(() => getUser());
  const [token, _setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active project for project-scoped API calls
  const [activeProject, setActiveProject] = useState(null);

  // Persist helpers
  function persistAuth(userData, tokenValue) {
    setToken(tokenValue);
    setUser(userData);
    _setToken(tokenValue);
    _setUser(userData);
  }

  function logout() {
    clearToken();
    clearUser();
    _setToken(null);
    _setUser(null);
    setActiveProject(null);
  }

  async function login(identifier, password) {
    setError(null);
    setLoading(true);

    const normalizedId = String(identifier || "").trim();
    const normalizedPassword = String(password || "");

    const isDemoAlex =
      (normalizedId.toLowerCase() === "alex" ||
        normalizedId.toLowerCase() === "alex123" ||
        normalizedId.toLowerCase() === "alex@example.com") &&
      normalizedPassword === "123";

    if (isDemoAlex) {
      const demoUser = {
        _id: "demo-alex",
        name: "Alex",
        email: "alex@example.com",
        employeeId: "alex123",
        role: "EMPLOYEE",
      };
      persistAuth(demoUser, "demo-alex-token");
      setActiveProject({ _id: "demo-project", name: "Project Alpha" });
      setLoading(false);
      return { success: true, data: { user: demoUser, token: "demo-alex-token" } };
    }

    try {
      const res = await authAPI.login(normalizedId, normalizedPassword);
      if (res?.success && res.data) {
        persistAuth(res.data.user, res.data.token);

        try {
          const projRes = await projectsAPI.list();
          const projects = projRes?.data?.projects || projRes?.data || [];
          if (projects.length > 0) setActiveProject(projects[0]);
        } catch {
          // project fetch is non-fatal for login
        }

        return res;
      }

      throw new Error(res?.message || "Login failed");
    } catch (err) {
      const message = err?.message || "Unable to log in";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    token,
    loading,
    error,
    activeProject,
    setActiveProject,
    login,
    logout,
    isAdmin: user?.role === "ADMIN",
    isSupervisor: user?.role === "SUPERVISOR",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
