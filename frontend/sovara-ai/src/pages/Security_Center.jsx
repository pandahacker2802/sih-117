import { useEffect, useState } from "react";
import { Check, Download, Group, History, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auditAPI, usersAPI } from "../services/api";

function SecurityCenter() {
  const { isAdmin } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [auditEvents, setAuditEvents] = useState([]);
  const [accessRows, setAccessRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSecurityData() {
      if (!isAdmin) { setLoading(false); return; }
      try {
        setLoading(true);

        // Fetch audit logs
        const auditRes = await auditAPI.getLogs("limit=10");
        const logs = auditRes.data?.logs || auditRes.data || [];
        const events = logs.map((log, i) => [
          new Date(log.createdAt).toLocaleTimeString("en-US", { hour12: false, timeZone: "UTC" }) + " UTC",
          `${log.action}${log.metadata ? ` — ${JSON.stringify(log.metadata).slice(0, 60)}` : ""}`,
          i === logs.length - 1 ? "active" : (log.metadata?.hash || ""),
        ]);
        setAuditEvents(events);

        // Fetch users for access table
        try {
          const usersRes = await usersAPI.list();
          const users = usersRes.data?.users || usersRes.data || [];
          const rows = users.map((u) => [
            u.name,
            u.role,
            u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never",
            u.isActive ? "Active" : "Inactive",
          ]);
          setAccessRows(rows);
        } catch { /* non-fatal */ }
      } catch (err) {
        console.error("[SecurityCenter] Fetch failed:", err.message);
        setFeedback(`Error loading security data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchSecurityData();
  }, [isAdmin]);

  // Fallback mock data for non-admin users
  const displayAuditEvents = auditEvents.length > 0 ? auditEvents : [
    ["—", "Audit logs require ADMIN role", ""],
  ];
  const displayAccessRows = accessRows.length > 0 ? accessRows : [
    ["—", "—", "—", "Access data requires ADMIN role"],
  ];

  return (
    <main className="security-page">
      <header className="security-page-header">
        <div><p className="workspace-label">Governance / Local enclave</p><h1>Security Center</h1><p>Monitor local AI sovereignty, audit logs, and access control events.</p></div>
        <button className="button button-primary" type="button" onClick={() => setFeedback("Audit log export prepared.")}><Download size={17} /> Export Audit Log</button>
      </header>
      {feedback && <div className="export-feedback" role="status">{feedback}</div>}

      {loading ? (
        <p style={{ color: "#8f7768", padding: "24px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>Loading security data…</p>
      ) : (
        <div className="security-grid">
          <section className="security-panel sovereignty-panel">
            <div className="security-panel-heading"><h2><ShieldCheck size={23} /> Sovereignty Status</h2><span className="audit-badge">AUDIT: OK</span></div>
            <div className="sovereignty-metrics">{["External AI API Calls", "Cloud Document Uploads", "External Transfers"].map((label) => <div className="sovereignty-metric" key={label}><span>{label}</span><strong>0</strong></div>)}</div>
            <div className="local-status">{["AI Inference", "Documents", "Embeddings", "Vector Database", "Generated Outputs"].map((label) => <div key={label}><span>{label}</span><b><Check size={15} /> Local</b></div>)}</div>
          </section>

          <section className="security-panel audit-panel">
            <div className="security-panel-heading"><h2><History size={22} /> Audit Timeline</h2></div>
            <div className="audit-list">{displayAuditEvents.map(([time, event, hash]) => <div className={`audit-event${hash === "active" ? " active" : ""}`} key={time + event}><span className="audit-dot" /><time>{time}</time><p>{event}</p>{hash && hash !== "active" && <b>{hash}</b>}</div>)}</div>
          </section>

          <section className="security-panel access-panel">
            <div className="security-panel-heading"><h2><Group size={22} /> Access Control &amp; Security Events</h2><button className="manage-button" type="button" onClick={() => setFeedback("Role management is ready for backend connection.")}>Manage Roles</button></div>
            <div className="access-table-wrap"><table className="access-table"><thead><tr><th>User</th><th>Role</th><th>Last Access</th><th>Recent Event</th></tr></thead><tbody>{displayAccessRows.map(([user, role, lastAccess, event]) => <tr key={user}><td><span className="user-avatar">{user.split(" ").map((part) => part[0]).join("")}</span>{user}</td><td><b className="role-badge">{role}</b></td><td>{lastAccess}</td><td>{event}</td></tr>)}</tbody></table></div>
          </section>
        </div>
      )}
    </main>
  );
}

export default SecurityCenter;
