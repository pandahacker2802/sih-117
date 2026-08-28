import { Bell, CheckSquare, ClipboardCheck, FileText, LibraryBig, LockKeyhole, Database, ShieldAlert, Thermometer } from "lucide-react";

export const dashboardMetrics = [
  ["Active Tasks", "24", "Requires attention", CheckSquare],
  ["Knowledge Sources", "551", "+12 this week", LibraryBig],
  ["Documents Processed", "1,284", "Local enclave", FileText],
  ["Pending Approvals", "7", "High priority", ClipboardCheck],
];

export const dashboardActivity = [
  ["Inspection report analyzed", "2 minutes ago", "success"],
  ["Agent deployed to sector 4", "1 hour ago", "warning"],
  ["Knowledge base sync complete", "3 hours ago", "neutral"],
];

export const systemStatuses = [
  ["AI Runtime", "Healthy", "healthy"],
  ["Knowledge Base", "Healthy", "healthy"],
  ["Document Engine", "Syncing", "syncing"],
  ["Agent Runtime", "Healthy", "healthy"],
  ["Storage (Local)", "Warning", "warning"],
];

export const dashboardApprovals = [
  ["Declassify Q3 Report", "Req: M. Vance • 2h ago"],
  ["Update Agent Protocol Alpha", "Req: System • 5h ago"],
];

export const approvalSources = [
  [FileText, "Drone_Scan_Log_7.json", "Micro-fractures detected. Severity: 0.2mm depth. Quadrant B support structures.", "View Source Document"],
  [Thermometer, "Thermal_Sensor_Array_B.csv", "Delta T of +4.2C observed near coolant valve 3 compared to baseline.", "View Data Visualization"],
];

export const deliverables = [
  [".docx", "Q3 Security Audit Report", "TSK-8921", "Oct 12, 2023", "approved", "blue"],
  [".xlsx", "Vendor Risk Assessment Matrix", "TSK-9044", "Oct 14, 2023", "pending", "green"],
  [".pdf", "Executive Briefing: Incident Alpha", "TSK-8810", "Oct 10, 2023", "approved", "red"],
];

export const deliverableDocuments = [
  ["Data Privacy Addendum v2", "Oct 08, 2023", "Sarah Jenkins", "approved"],
  ["Q4 OKR Planning Doc", "Oct 05, 2023", "Mike Chen", "draft"],
];

export const registryDocuments = [
  ["Q4_Strategic_Briefing_v2.pdf", "PDF", "4.2 MB", "Complete", "COMPLETED", "J. Vance", "pdf", "complete"],
  ["Project_Titan_Requirements.docx", "DOCX", "1.1 MB", "OCR Extracting", "PENDING", "System", "docx", "processing"],
  ["Financial_Audit_2023_Final.csv", "CSV", "12.8 MB", "Complete", "INDEXED", "E. Stone", "csv", "complete"],
  ["Corrupted_Archive_Backup.zip", "ZIP", "450 MB", "Failed", "ERROR", "System", "zip", "error"],
];

export const notifications = [
  ["Approval requested", "Declassify Q3 Report is waiting for your review.", "12 min ago", ClipboardCheck, true],
  ["Document processed", "Inspection_Report_042.pdf is ready for analysis.", "1 hour ago", FileText, false],
  ["Security event", "A new local access policy was applied.", "Yesterday", ShieldAlert, false],
];

export const profile = {
  name: "Alex Mercer",
  role: "Workspace Administrator",
  email: "alex.mercer@sovara.local",
  organization: "Sovara Industrial Systems",
};

export const settings = [
  ["Local inference", "Keep model execution inside the local enclave", true, LockKeyhole],
  ["Automatic indexing", "Index newly uploaded documents after processing", true, Database],
  ["Approval notifications", "Notify reviewers when an item needs attention", true, Bell],
];

export const securityAuditEvents = [
  ["14:32:01 UTC", "Document uploaded: Project_Alpha_Specs.pdf", "HASH: 8f4e9a..."],
  ["14:32:05 UTC", "Local embedding generation started."],
  ["14:32:45 UTC", "Local embedding complete. Added to Vector DB."],
  ["14:35:12 UTC", "Inference query executed against Vector DB."],
  ["14:35:15 UTC", "Output generated and securely stored.", "active"],
];

export const securityAccessRows = [
  ["A. Mercer", "ADMIN", "Today, 14:00", "Policy updated"],
  ["E. Jenson", "ANALYST", "Yesterday, 09:15", "Inference query executed"],
  ["S. Rossi", "VIEWER", "2 days ago", "Report downloaded"],
];

export const workspaceDocuments = ["SOP-17_Safety_Guidelines.pdf", "Inspection_Report_042.pdf"];

export const workspaceSources = [
  ["High Relevance", "SOP-17_Safety_Guidelines.pdf", "Section 4.2: Reactive Materials", "primary"],
  ["Context", "Inspection_Report_042.pdf", "Page 3: Sector G Observations", "neutral"],
];

export const taskTabDefinitions = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "awaiting", label: "Awaiting Approval" },
  { key: "failed", label: "Failed" },
];

export const tasks = [
  {
    id: "TSK-8924-X", tab: "active", name: "Quarterly Competitor Analysis Draft",
    description: "Cross-referencing market intelligence feeds to surface competitor positioning shifts for the Q3 board briefing.", status: "in-progress", statusLabel: "In Progress",
    created: "2023-10-24", duration: "2h 15m", owner: "Agent-Sigma", ownerKind: "agent", tools: ["search", "database"], progress: 65,
    timeline: [
      { time: "10:00 AM", text: "Data ingestion from secure endpoints initiated.", state: "done" },
      { time: "11:15 AM", text: "Synthesizing entity relationships and anomalous market signals.", state: "current", sources: ["Q3_Financial_Review.pdf", "Competitor_Metrics_Raw.csv"] },
      { time: "Pending", text: "Generate final executive summary document.", state: "pending" },
    ],
    sources: [
      { label: "High Relevance", name: "Q3_Financial_Review.pdf", detail: "Section 2: Segment revenue breakdown", tone: "primary" },
      { label: "Context", name: "Competitor_Metrics_Raw.csv", detail: "1,204 rows · pricing & headcount signals", tone: "neutral" },
    ],
    actions: [
      { time: "11:15 AM", text: 'Called tool web_search("competitor Q3 pricing changes")' },
      { time: "10:42 AM", text: "Retrieved 14 documents from Knowledge Hub collection Facility Q3" },
      { time: "10:00 AM", text: "Task claimed by Agent-Sigma" },
    ],
    output: { name: "Competitor_Analysis_Draft_v1.docx", type: "DOCX", note: "Draft in progress · 65% complete" },
    audit: [
      { text: "Progress checkpoint saved", time: "Today, 11:15 AM" },
      { text: "Task escalated to priority queue", time: "Today, 10:05 AM" },
      { text: "Task created by J. Vance", time: "Today, 10:00 AM" },
    ],
  },
  {
    id: "TSK-8925-B", tab: "active", name: "Redact Personnel Files (Batch B)",
    description: "Automated PII redaction sweep across the personnel archive ahead of the external audit handoff.", status: "queued", statusLabel: "Queued",
    created: "2023-10-25", duration: "--", owner: "System", ownerKind: "system", tools: ["shield"], waiting: true, progress: 0,
    timeline: [{ time: "Queued", text: "Task is queued and waiting for a compute slot to free up.", state: "pending" }],
    sources: [{ label: "Context", name: "Personnel_Archive_2023.zip", detail: "3,402 files pending scan", tone: "neutral" }],
    actions: [{ time: "2023-10-25", text: "Task queued by System scheduler" }], output: { name: "—", type: "—", note: "No output generated yet" },
    audit: [{ text: "Task queued, waiting for resources", time: "2023-10-25" }],
  },
  {
    id: "TSK-8790-C", tab: "completed", name: "Vendor Contract Compliance Review",
    description: "Reviewed active vendor contracts against the updated sovereignty and data-residency clauses.", status: "completed", statusLabel: "Completed",
    created: "2023-10-20", duration: "3h 10m", owner: "Agent-Sigma", ownerKind: "agent", tools: ["database", "search"], progress: 100,
    timeline: [{ time: "09:00 AM", text: "Contract batch pulled from Legal knowledge collection.", state: "done" }, { time: "12:10 PM", text: "Compliance summary generated and routed for approval.", state: "done" }],
    sources: [{ label: "Context", name: "Vendor_Contracts_2023.pdf", detail: "48 contracts reviewed", tone: "neutral" }], actions: [{ time: "12:10 PM", text: "Generated compliance summary document" }],
    output: { name: "Vendor_Compliance_Summary.pdf", type: "PDF", note: "Approved and archived" }, audit: [{ text: "Task completed and archived", time: "2023-10-20, 12:10 PM" }],
  },
  {
    id: "TSK-8910-F", tab: "awaiting", name: "Site Inspection Note: Sector 4 Alpha",
    description: "Drafted structural inspection note pending human authorization before release.", status: "awaiting-approval", statusLabel: "Awaiting Approval",
    created: "2023-10-24", duration: "1h 55m", owner: "Agent-Sigma", ownerKind: "agent", tools: ["radar"], progress: 100,
    timeline: [{ time: "09:15 AM", text: "Draft note generated and submitted for human review.", state: "done" }],
    sources: [{ label: "High Relevance", name: "Drone_Scan_Log_7.json", detail: "Micro-fractures, Quadrant B", tone: "primary" }], actions: [{ time: "09:15 AM", text: "Submitted draft note for human-in-the-loop review" }],
    output: { name: "Sector4_Alpha_Inspection_Note.pdf", type: "PDF", note: "Pending approval" }, audit: [{ text: "Routed to Approvals queue", time: "2023-10-24, 9:15 AM" }],
  },
  {
    id: "TSK-8802-Z", tab: "failed", name: "Legacy Archive De-duplication",
    description: "Attempted to de-duplicate the legacy document archive prior to cold storage migration.", status: "failed", statusLabel: "Failed",
    created: "2023-10-19", duration: "22m", owner: "System", ownerKind: "system", tools: ["database"], progress: 0,
    error: "Connection to secure endpoint timed out after 3 retries.", timeline: [{ time: "03:10 PM", text: "Legacy archive sync started against cold storage endpoint.", state: "done" }, { time: "03:32 PM", text: "Connection to secure endpoint timed out after 3 retries.", state: "failed" }],
    sources: [{ label: "Context", name: "Legacy_Archive_Index.csv", detail: "1.2M records indexed", tone: "neutral" }], actions: [{ time: "03:32 PM", text: "Retry limit reached, task marked failed" }], output: { name: "—", type: "—", note: "No output generated" },
    audit: [{ text: "Task failed, flagged for manual retry", time: "2023-10-19, 3:32 PM" }],
  },
];
