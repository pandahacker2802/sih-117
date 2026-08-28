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

/**
 * Seed credentials — the app auto-logs in on mount if no token is stored.
 * This removes the need for a Login page during development.
 */
const SEED_EMAIL = "admin@example.com";
const SEED_PASSWORD = "SystemAdmin@2026";

export function AuthProvider({ children }) {
  const [user, _setUser] = useState(() => getUser());
  const [token, _setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(!getToken()); // only show loading if we need to auto-login
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

  // Auto-login on mount if there is no token
  useEffect(() => {
    async function autoLogin() {
      // If we already have a token, verify it is still valid by trying a protected call
      const existingToken = getToken();
      if (existingToken) {
        try {
          const res = await projectsAPI.list();
          if (res.success) {
            // Token still good — pick the first project as active
            const projects = res.data?.projects || res.data || [];
            if (projects.length > 0) setActiveProject(projects[0]);
            setLoading(false);
            return;
          }
        } catch {
          // Token expired or invalid — fall through to re-login
          clearToken();
          clearUser();
        }
      }

      // No valid token — login with seed credentials
      try {
        const res = await authAPI.login(SEED_EMAIL, SEED_PASSWORD);
        if (res.success && res.data) {
          persistAuth(res.data.user, res.data.token);

          // Fetch projects so pages that need a projectId can use it
          try {
            const projRes = await projectsAPI.list();
            const projects = projRes.data?.projects || projRes.data || [];
            if (projects.length > 0) setActiveProject(projects[0]);
          } catch {
            // projects fetch failed — non-fatal
          }
        }
      } catch (err) {
        console.error("[AuthContext] Auto-login failed:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    autoLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    user,
    token,
    loading,
    error,
    activeProject,
    setActiveProject,
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
