import { useEffect, useState } from "react";
import { Check, ClipboardCheck, FileText, ShieldAlert, Bell } from "lucide-react";
import { notificationsAPI } from "../services/api";

const TYPE_ICONS = {
  REPORT_SUBMITTED: ClipboardCheck,
  REPORT_APPROVED: FileText,
  REPORT_REJECTED: ShieldAlert,
  SYSTEM: Bell,
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await notificationsAPI.list();
      setNotifications(res.data?.notifications || res.data || []);
      setError(null);
    } catch (err) {
      console.error("[Notifications] Fetch failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNotifications(); }, []);

  async function markAllRead() {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("[Notifications] Mark all read failed:", err.message);
    }
  }

  async function markOneRead(id) {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("[Notifications] Mark read failed:", err.message);
    }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Yesterday" : `${days} days ago`;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="account-page">
      <header className="account-header">
        <div>
          <p className="workspace-label">Workspace / Activity</p>
          <h1>Notifications</h1>
          <p>Review important changes across your Sovara workspace.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={markAllRead}>
          <Check size={16} /> Mark all read
        </button>
      </header>

      <section className="account-panel notification-panel">
        <div className="security-panel-heading">
          <h2>Recent notifications</h2>
          <span className="audit-badge">
            {loading ? "LOADING…" : `${notifications.length} EVENT${notifications.length !== 1 ? "S" : ""}`}
          </span>
        </div>

        {error && <p style={{ color: "#ef8e84", padding: "12px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>Failed to load: {error}</p>}

        {!loading && notifications.length === 0 && (
          <p style={{ color: "#8f7768", padding: "24px 0", textAlign: "center" }}>No notifications yet.</p>
        )}

        <div className="notification-list">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <article
                className={`notification-row${!n.isRead ? " unread" : ""}`}
                key={n._id}
                onClick={() => !n.isRead && markOneRead(n._id)}
                style={{ cursor: !n.isRead ? "pointer" : "default" }}
              >
                <span className="notification-icon"><Icon size={18} /></span>
                <div>
                  <strong>{n.type?.replace(/_/g, " ") || "Notification"}</strong>
                  <p>{n.message}</p>
                  <time>{timeAgo(n.createdAt)}</time>
                </div>
                {!n.isRead && <i className="notification-dot" />}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Notifications;
