import { useEffect, useState } from "react";
import { CheckCircle2, Download, FileText, Plus, Clock3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { reportsAPI } from "../services/api";

function statusTone(status) {
  switch (status) {
    case "APPROVED": return "approved";
    case "PENDING_REVIEW": return "pending";
    case "DRAFT": return "pending";
    case "REJECTED": return "rejected";
    default: return "pending";
  }
}

function statusColor(status) {
  switch (status) {
    case "APPROVED": return "blue";
    case "PENDING_REVIEW": return "green";
    case "DRAFT": return "green";
    case "REJECTED": return "red";
    default: return "blue";
  }
}

function Deliverables() {
  const { activeProject } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exported, setExported] = useState("");

  useEffect(() => {
    async function fetchReports() {
      if (!activeProject) { setLoading(false); return; }
      try {
        setLoading(true);
        const res = await reportsAPI.list(activeProject._id);
        setReports(res.data?.reports || res.data || []);
        setError(null);
      } catch (err) {
        console.error("[Deliverables] Fetch failed:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [activeProject]);

  function exportFile(name) {
    setExported(`${name} queued for export`);
  }

  // Transform reports into the deliverable card format
  const deliverables = reports.map((r) => [
    ".pdf", // default type
    r.title,
    r._id?.slice(-6)?.toUpperCase() || "—",
    new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    statusTone(r.status),
    statusColor(r.status),
  ]);

  // For the "All Documents" table at the bottom
  const documents = reports.map((r) => [
    r.title,
    new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    r.createdBy?.name || "System",
    statusTone(r.status),
  ]);

  return (
    <main className="deliverables-page">
      <header className="deliverables-header">
        <div><p className="workspace-label">Outputs / Archive</p><h1>Deliverables</h1><p>Generated artifacts and final outputs ready for external distribution or archival.</p></div>
        <button className="button button-primary" type="button" onClick={() => setExported("Deliverable generation queued.")}><Plus size={17} /> Generate Deliverable</button>
      </header>
      {exported && <div className="export-feedback" role="status">{exported}</div>}
      {error && <div className="export-feedback" role="alert" style={{ color: "#ef8e84" }}>Error: {error}</div>}

      {loading ? (
        <p style={{ color: "#8f7768", padding: "24px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>Loading deliverables…</p>
      ) : (
        <>
          <section>
            <div className="section-heading"><h2>Recent Deliverables</h2><span>{deliverables.length} artifact{deliverables.length !== 1 ? "s" : ""}</span></div>
            {deliverables.length === 0 ? (
              <p style={{ color: "#8f7768", padding: "24px", textAlign: "center" }}>No deliverables found for this project.</p>
            ) : (
              <div className="deliverable-grid">{deliverables.map(([type, name, reference, date, status, tone]) => <article className="deliverable-card" key={reference}><div className="deliverable-card-top"><span className={`file-type ${tone}`}>{type}</span><span className={`deliverable-status ${status}`}>{status === "approved" ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{status}</span></div><h3>{name}</h3><p className="reference">Ref: {reference}</p><div className="deliverable-card-footer"><time>{date}</time><button onClick={() => exportFile(name)}><Download size={15} /> Export</button></div></article>)}</div>
            )}
          </section>
          <section className="documents-section">
            <div className="section-heading"><h2>All Documents</h2><span>{documents.length} record{documents.length !== 1 ? "s" : ""}</span></div>
            <div className="documents-table-wrap"><table className="documents-table"><thead><tr><th>Name</th><th>Created</th><th>Author</th><th>Status</th></tr></thead><tbody>{documents.map(([name, date, author, status]) => <tr key={name}><td><FileText size={19} />{name}</td><td>{date}</td><td>{author}</td><td><span className={`document-status ${status}`}><i />{status}</span></td></tr>)}</tbody></table></div>
          </section>
        </>
      )}
    </main>
  );
}

export default Deliverables;
