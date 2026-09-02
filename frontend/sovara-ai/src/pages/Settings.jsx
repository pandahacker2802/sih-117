import { useAuth } from "../context/AuthContext";
import { LogOut, ShieldCheck, SlidersHorizontal } from "lucide-react";

function Settings() {
  const { user, logout } = useAuth();

  return (
    <main className="account-page">
      <header className="account-header">
        <div>
          <p className="workspace-label">Control / Preferences</p>
          <h1>Settings</h1>
        </div>
      </header>

      <section className="account-panel settings-panel">
        <div className="security-panel-heading">
          <h2>Workspace preferences</h2>
        </div>

        <div className="audit-list">
          <div className="audit-row">
            <div>
              <h3>Security posture</h3>
              <p>Role-based access and project boundary controls are active for {user?.name || "this user"}.</p>
            </div>
            <ShieldCheck size={18} />
          </div>
          <div className="audit-row">
            <div>
              <h3>Automation & alerts</h3>
              <p>Notifications, approvals, and risk escalations are currently enabled.</p>
            </div>
            <SlidersHorizontal size={18} />
          </div>
        </div>

        <button className="button button-secondary" type="button" onClick={logout} style={{ marginTop: "24px" }}>
          <LogOut size={16} /> Log out
        </button>
      </section>
    </main>
  );
}

export default Settings;
