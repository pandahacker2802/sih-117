import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/static/Header";
import Sidebar from "./components/static/Sidebar";
import { useAuth } from "./context/AuthContext";

// Dashboard
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/AI_Workspace";
import Tasks from "./pages/Tasks";
import Knowledge from "./pages/Knowlegde_Hub";

// Other Pages
import Approvals from "./pages/Approvals";
import Deliverables from "./pages/Deliverables";
import Documents from "./pages/Documents";
import SecurityCenter from "./pages/Security_Center";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

function App() {
  const { loading, error } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#171310",
        color: "#eae1db",
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid #2e2926",
          borderTopColor: "#ffb784",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "16px"
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ fontSize: "14px", letterSpacing: "0.05em", color: "#dbc2b2" }}>Initializing secure local enclave...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#171310",
        color: "#ef8e84",
        padding: "24px",
        textAlign: "center",
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <h2 style={{ color: "#ef8e84", margin: "0 0 12px 0", fontSize: "18px" }}>Enclave Connection Failed</h2>
        <p style={{ color: "#dbc2b2", fontSize: "14px", maxWidth: "480px", margin: "0 0 20px 0" }}>{error}</p>
        <p style={{ color: "#8f7768", fontSize: "12px" }}>Ensure the Node.js backend is running at http://localhost:5000 and the MongoDB database is accessible.</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <Routes>

        {/* =========================
            DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/workspace"
          element={<Workspace />}
        />

        <Route
          path="/dashboard/tasks"
          element={<Tasks />}
        />

        <Route
          path="/dashboard/knowledge"
          element={<Knowledge />}
        />


        {/* =========================
            OTHER PAGES
        ========================= */}

        <Route
          path="/approvals"
          element={<Approvals />}
        />

        <Route
          path="/deliverables"
          element={<Deliverables />}
        />

        <Route
          path="/documents"
          element={<Documents />}
        />

        <Route
          path="/security"
          element={<SecurityCenter />}
        />

        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />


        {/* =========================
            DEFAULT ROUTE
        ========================= */}

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />


        {/* =========================
            404 / UNKNOWN ROUTE
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

        </Routes>
      </div>
    </div>
  );
}

export default App;