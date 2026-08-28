import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ClipboardCheck, Plus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { dashboardActivity as activity, dashboardMetrics as defaultMetrics, systemStatuses as statuses } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { notificationsAPI, projectsAPI, reportsAPI } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const { user, activeProject } = useAuth();

  const [metrics, setMetrics] = useState(defaultMetrics);
  const [approvals, setApprovals] = useState([]);
  const [greeting, setGreeting] = useState("Good morning");

  // Determine greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch live data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch projects count
        const projRes = await projectsAPI.list();
        const projects = projRes.data?.projects || projRes.data || [];

        // Fetch notifications to get pending approvals count
        let pendingCount = 0;
        try {
          const notifRes = await notificationsAPI.list();
          const notifications = notifRes.data?.notifications || notifRes.data || [];
          pendingCount = notifications.filter((n) => !n.isRead).length;
        } catch { /* non-fatal */ }

        // Fetch reports from active project for pending approvals list
        if (activeProject) {
          try {
            const reportRes = await reportsAPI.list(activeProject._id);
            const reports = reportRes.data?.reports || reportRes.data || [];
            const pending = reports
              .filter((r) => r.status === "PENDING_REVIEW")
              .map((r) => [r.title, `Req: ${r.createdBy?.name || "Unknown"} • ${new Date(r.createdAt).toLocaleDateString()}`]);
            setApprovals(pending);
          } catch { /* non-fatal */ }
        }

        // Update metrics with real project count and pending approval count
        setMetrics((prev) =>
          prev.map(([label, value, note, Icon], i) => {
            if (i === 3) return [label, String(pendingCount), pendingCount > 0 ? "High priority" : "All clear", Icon];
            return [label, value, note, Icon];
          })
        );
      } catch (err) {
        console.error("[Dashboard] Failed to fetch data:", err.message);
      }
    }

    fetchDashboardData();
  }, [activeProject]);

  const displayName = user?.name?.split(" ")[0] || "Operator";
  const dashboardApprovals = approvals.length > 0
    ? approvals
    : [["No pending approvals", "Everything is up to date"]];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> Sovereign intelligence</p>
          <h1>{greeting}, {displayName}.</h1>
          <p className="subtitle">Your workspace is ready.</p>
        </div>
        <div className="header-actions">
          <button className="button button-secondary" type="button" onClick={() => navigate("/deliverables")}>View Reports</button>
          {/* Backend connection point: POST /api/tasks or /api/workspaces for the selected quick action. */}
          <button className="button button-primary" type="button" onClick={() => navigate("/dashboard/workspace") }><Plus size={17} /> Quick Action</button>
        </div>
      </header>

      <section className="metric-grid" aria-label="Workspace metrics">
        {metrics.map(([label, value, note, Icon], index) => (
          <article className={`metric-card${index === 1 ? " metric-card-accent" : ""}`} key={label}>
            <div className="card-label"><span>{label}</span><Icon size={19} /></div>
            <strong>{value}</strong>
            <span className="card-note">{note}</span>
          </article>
        ))}
      </section>

      <section className="middle-grid">
        <article className="panel activity-panel">
          <div className="panel-heading"><div><p className="eyebrow">System pulse</p><h2>AI activity <span>(last 7 days)</span></h2></div><Activity size={19} className="heading-icon" /></div>
          <div className="chart-wrap">
            <svg className="activity-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="AI activity trend">
              <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ffb784" stopOpacity=".28" /><stop offset="1" stopColor="#ffb784" stopOpacity="0" /></linearGradient></defs>
              <path d="M0 80 Q20 70 40 50 T70 40 T100 20 L100 100 L0 100Z" fill="url(#chart-fill)" />
              <path d="M0 80 Q20 70 40 50 T70 40 T100 20" fill="none" stroke="#ffb784" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <circle cx="70" cy="40" r="2.6" fill="#ffb784" />
            </svg>
            <div className="chart-days">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
          </div>
        </article>

        <article className="panel recent-panel">
          <div className="panel-heading"><h2>Recent activity</h2><Zap size={18} className="heading-icon" /></div>
          <ul className="activity-list">{activity.map(([text, time, tone]) => <li key={text}><span className={`activity-dot ${tone}`} /><div><p>{text}</p><time>{time}</time></div></li>)}</ul>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-heading"><h2>System status</h2><ShieldCheck size={18} className="heading-icon" /></div>
          <div className="status-list">{statuses.map(([name, status, tone]) => <div className="status-row" key={name}><span>{name}</span><b className={`status-pill ${tone}`}>{status}</b></div>)}</div>
        </article>
        <article className="panel">
          <div className="panel-heading"><h2>Pending approvals</h2><ClipboardCheck size={18} className="heading-icon" /></div>
          <div className="approval-list">
            {dashboardApprovals.map(([title, detail]) => <Approval title={title} detail={detail} key={title} />)}
          </div>
        </article>
      </section>
    </main>
  );
}

function Approval({ title, detail }) {
  const navigate = useNavigate();
  return <div className="approval-row"><div><p>{title}</p><span>{detail}</span></div><button className="review-button" type="button" onClick={() => navigate("/approvals")}>Review</button></div>;
}

export default Dashboard;
