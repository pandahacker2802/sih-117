import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, CloudUpload, FileText, Filter, MoreVertical, Play, Search, AlertTriangle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { filesAPI } from "../services/api";

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function mapStatus(status) {
  switch (status) {
    case "READY": return "complete";
    case "PROCESSING": return "processing";
    case "UPLOADED": return "processing";
    case "FAILED": return "error";
    default: return "complete";
  }
}

function mapProcessing(status) {
  switch (status) {
    case "READY": return "Complete";
    case "PROCESSING": return "Processing";
    case "UPLOADED": return "Queued";
    case "FAILED": return "Failed";
    default: return status;
  }
}

function mimeToType(mime) {
  if (!mime) return "FILE";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("docx")) return "DOCX";
  if (mime.includes("csv")) return "CSV";
  if (mime.includes("excel") || mime.includes("xlsx")) return "XLSX";
  if (mime.includes("zip")) return "ZIP";
  if (mime.includes("text")) return "TXT";
  return mime.split("/").pop()?.toUpperCase() || "FILE";
}

function mimeToIcon(mime) {
  if (!mime) return "file";
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("word") || mime.includes("docx")) return "docx";
  if (mime.includes("csv")) return "csv";
  return "file";
}

function Documents() {
  const { activeProject } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [documentAction, setDocumentAction] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file || !activeProject) return;
    setUploading(true);
    setUploadError(null);
    try {
      await filesAPI.upload(activeProject._id, file, "INTERNAL");
      setUploaded(true);
      // Refresh the file list
      const res = await filesAPI.list(activeProject._id);
      const files = res.data?.files || res.data || [];
      const rows = files.map((f) => [
        f.originalName || f.filename,
        mimeToType(f.mimeType),
        formatSize(f.size),
        mapProcessing(f.status),
        f.status === "READY" ? "INDEXED" : f.status,
        f.uploadedBy?.name || "System",
        mimeToIcon(f.mimeType),
        mapStatus(f.status),
      ]);
      setDocuments(rows);
      if (rows.length > 0) setSelected(rows[0]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded if needed
      event.target.value = "";
    }
  }

  useEffect(() => {
    async function fetchFiles() {
      if (!activeProject) { setLoading(false); return; }
      try {
        setLoading(true);
        const res = await filesAPI.list(activeProject._id);
        const files = res.data?.files || res.data || [];
        // Transform backend file objects into the tuple format the UI expects:
        // [name, type, size, processing, knowledge, owner, iconClass, state]
        const rows = files.map((f) => [
          f.originalName || f.filename,
          mimeToType(f.mimeType),
          formatSize(f.size),
          mapProcessing(f.status),
          f.status === "READY" ? "INDEXED" : f.status,
          f.uploadedBy?.name || "System",
          mimeToIcon(f.mimeType),
          mapStatus(f.status),
        ]);
        setDocuments(rows);
        if (rows.length > 0) setSelected(rows[0]);
        setError(null);
      } catch (err) {
        console.error("[Documents] Fetch failed:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, [activeProject]);

  const filteredDocuments = useMemo(() =>
    documents.filter(([name, type, , , , owner, , state]) =>
      (statusFilter === "all" || state === statusFilter) &&
      `${name} ${type} ${owner}`.toLowerCase().includes(query.toLowerCase())
    ), [query, statusFilter, documents]);

  return (
    <main className="documents-page">
      <section className="document-registry">
        <header className="registry-header"><div><p className="workspace-label">Knowledge / Registry</p><h1>Document Registry</h1><p>Manage and index sovereign files for AI processing.</p></div><label className="select-control"><Filter size={16} /><span className="sr-only">Filter documents by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="complete">Complete</option><option value="processing">Processing</option><option value="error">Failed</option></select></label></header>
        <div className="document-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents, metadata, or content hash..." /></div>
        {/* Real multipart/form-data upload — field name: "file" */}
        <label className={`upload-zone${uploaded ? " uploaded" : ""}${uploading ? " uploading" : ""}`}>
          <input type="file" hidden disabled={uploading} onChange={handleFileChange} />
          <span><CloudUpload size={25} /></span>
          <strong>{uploading ? "Uploading…" : uploaded ? "Document uploaded successfully" : "Drag and drop files here"}</strong>
          <em>{uploading ? "Saving file to server…" : uploaded ? "File is queued for AI indexing" : "or click to browse from your computer"}</em>
          <small>Supported formats: PDF, DOCX, CSV, TXT (Max 100MB)</small>
        </label>
        {documentAction && <div className="export-feedback" role="status">{documentAction}</div>}
        {(error || uploadError) && <div className="export-feedback" role="alert" style={{ color: "#ef8e84" }}>Error: {uploadError || error}</div>}

        {loading ? (
          <p style={{ color: "#8f7768", padding: "24px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>Loading documents…</p>
        ) : (
          <div className="document-table-wrap"><table className="document-table"><thead><tr><th><input type="checkbox" aria-label="Select all documents" /></th><th>Document</th><th>Type</th><th>Size</th><th>Processing</th><th>Knowledge Status</th><th>Owner</th><th /></tr></thead><tbody>{filteredDocuments.map((document) => <DocumentRow document={document} selected={selected?.[0] === document[0]} onSelect={(documentItem) => { setSelected(documentItem); setDetailsOpen(true); }} onAction={setDocumentAction} key={document[0]} />)}</tbody></table>{filteredDocuments.length === 0 && <p className="empty-documents">No documents match your search.</p>}</div>
        )}
      </section>
      {detailsOpen && selected && <aside className="document-detail"><div className="detail-header"><div className="detail-title"><span><FileText size={20} /></span><div><h2>{selected[0]}</h2><p>Status: {selected[3]}</p></div></div><button aria-label="Close details" type="button" onClick={() => setDetailsOpen(false)}><X size={18} /></button></div><div className="detail-body"><div className="preview-card"><div><span>Preview</span><button aria-label="Open preview" type="button"><ChevronRight size={16} /></button></div><div className="paper-preview"><b /><i /><i /><i /><i /></div></div><DetailStatus /><div className="detail-card"><div className="detail-card-heading"><span>Knowledge collections</span><button aria-label="Add collection" type="button"><span>+</span></button></div><div className="collection-list"><span>Q4 Strategy</span><span>Board Materials</span></div></div><AuditLog /></div></aside>}
    </main>
  );
}

function DocumentRow({ document, selected, onSelect, onAction }) {
  const [name, type, size, processing, knowledge, owner, icon, state] = document;
  const [menuOpen, setMenuOpen] = useState(false);
  function runAction(action) {
    setMenuOpen(false);
    onAction(`${action} queued for ${name}.`);
  }

  return <tr className={selected ? "selected-row" : ""} onClick={() => onSelect(document)}><td><input type="checkbox" checked={selected} onChange={() => onSelect(document)} onClick={(event) => event.stopPropagation()} aria-label={`Select ${name}`} /></td><td><div className={`file-icon ${icon}`}><FileText size={18} /></div><strong>{name}</strong></td><td>{type}</td><td>{size}</td><td><span className={`processing-state ${state}`}>{state === "complete" ? <CheckCircle2 size={16} /> : state === "error" ? <AlertTriangle size={16} /> : <Play size={15} />}{processing}</span></td><td><b className={`knowledge-state ${state}`}>{knowledge}</b></td><td>{owner}</td><td className="document-actions-cell"><button className="row-menu" type="button" aria-label={`Actions for ${name}`} aria-expanded={menuOpen} onClick={(event) => { event.stopPropagation(); setMenuOpen(!menuOpen); }}><MoreVertical size={17} /></button>{menuOpen && <div className="document-action-menu" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => { onSelect(document); setMenuOpen(false); }}>View details</button><button type="button" onClick={() => runAction("Reindex")}>Reindex</button><button type="button" className="danger-action" onClick={() => runAction("Archive")}>Archive</button></div>}</td></tr>;
}

function DetailStatus() {
  return <div className="detail-card"><h3>Processing status</h3><div className="detail-status-list"><div><span>OCR Engine</span><b>Sovara Vision v4.2</b></div><div><span>Tokens Extracted</span><b>42,108</b></div><div><span>Entities Found</span><b>156</b></div><div><span>Status</span><b className="success-text"><CheckCircle2 size={13} /> SUCCESS</b></div></div></div>;
}

function AuditLog() {
  return <div className="detail-card audit-log"><h3>Audit log</h3><div><span>Vector embeddings generated<small>Today, 10:45 AM</small></span><span>OCR Processing complete<small>Today, 10:42 AM</small></span><span>Document uploaded<small>Today, 10:40 AM by J. Vance</small></span></div></div>;
}

export default Documents;
