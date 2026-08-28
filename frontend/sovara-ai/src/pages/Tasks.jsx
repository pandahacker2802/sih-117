import { useEffect, useMemo, useState } from "react";
import {
	AlertTriangle,
	ArrowUpDown,
	Bot,
	Boxes,
	CalendarRange,
	Check,
	CheckCircle2,
	ChevronRight,
	Cpu,
	Database,
	Download,
	ExternalLink,
	FileText,
	Filter,
	LineChart,
	Loader2,
	MoreVertical,
	Plus,
	Radar,
	Search,
	ShieldCheck,
	Wrench,
} from "lucide-react";
import "./Task.css";
import { useAuth } from "../context/AuthContext";
import { analysesAPI, filesAPI } from "../services/api";

const TOOL_ICONS = {
	search: Search,
	database: Database,
	radar: Radar,
	chart: LineChart,
	boxes: Boxes,
	shield: ShieldCheck,
	ocr_scan: FileText,
	regex_pii_check: ShieldCheck,
	sovereignty_region_match: Radar,
};

function Tasks() {
	const { activeProject } = useAuth();
	const [rawTasks, setRawTasks] = useState([]);
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [activeTab, setActiveTab] = useState("active");
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const [taskAction, setTaskAction] = useState("");
	const [ownerFilter, setOwnerFilter] = useState("all");
	const [sortOrder, setSortOrder] = useState("created");
	const [dateFilter, setDateFilter] = useState("all");

	async function fetchTasks() {
		if (!activeProject) { setLoading(false); return; }
		try {
			setLoading(true);
			const [analysisRes, filesRes] = await Promise.all([
				analysesAPI.list(activeProject._id),
				filesAPI.list(activeProject._id)
			]);

			const analyses = analysisRes.data?.analyses || analysisRes.data || [];
			const projectFiles = filesRes.data?.files || filesRes.data || [];
			setFiles(projectFiles);

			// Transform Mongoose Analysis schema into Frontend task format
			const mapped = analyses.map((a) => {
				// tab is either active, completed, or failed
				let tab = "active";
				if (a.status === "COMPLETED") tab = "completed";
				if (a.status === "FAILED" || a.status === "CANCELLED") tab = "failed";
				if (a.status === "PENDING_REVIEW") tab = "awaiting";

				let status = "in-progress";
				if (a.status === "QUEUED") status = "queued";
				if (a.status === "COMPLETED") status = "completed";
				if (a.status === "FAILED") status = "failed";
				if (a.status === "CANCELLED") status = "failed";
				if (a.status === "PENDING_REVIEW") status = "awaiting-approval";

				const statusLabelMap = {
					QUEUED: "Queued",
					RUNNING: "In Progress",
					COMPLETED: "Completed",
					FAILED: "Failed",
					CANCELLED: "Cancelled",
					PENDING_REVIEW: "Awaiting Approval",
				};

				const createdDate = new Date(a.createdAt);
				const formattedDate = createdDate.toISOString().split("T")[0];

				let duration = "--";
				if (a.startedAt && a.completedAt) {
					const diffMs = new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime();
					const diffSecs = Math.floor(diffMs / 1000);
					if (diffSecs < 60) duration = `${diffSecs}s`;
					else duration = `${Math.floor(diffSecs / 60)}m ${diffSecs % 60}s`;
				}

				const ownerName = a.createdBy?.name || "System Agent";
				const ownerKind = a.createdBy?.role === "ADMIN" ? "system" : "agent";

				const progress = a.status === "COMPLETED" ? 100 : a.status === "RUNNING" ? 50 : 0;

				// Map input files
				const sources = (a.inputFiles || []).map((fileId) => {
					const foundFile = projectFiles.find((f) => f._id === fileId || f === fileId);
					const fileName = typeof foundFile === "object" ? (foundFile.originalName || foundFile.filename) : "Unknown File";
					return {
						label: "Input File",
						name: fileName,
						detail: `ID: ${fileId.slice(-6).toUpperCase()}`,
						tone: "primary"
					};
				});

				// Build timeline
				const timeline = [];
				timeline.push({ time: createdDate.toLocaleTimeString(), text: "Task created and queued in secure enclave.", state: "done" });
				if (a.startedAt) {
					timeline.push({ time: new Date(a.startedAt).toLocaleTimeString(), text: "Agent execution started.", state: "done" });
				}
				if (a.status === "COMPLETED") {
					timeline.push({ time: new Date(a.completedAt || a.updatedAt).toLocaleTimeString(), text: "Analysis completed successfully.", state: "done" });
				} else if (a.status === "FAILED") {
					timeline.push({ time: new Date(a.updatedAt).toLocaleTimeString(), text: `Analysis failed: ${a.result?.details || "Unknown error"}`, state: "failed" });
				} else if (a.status === "CANCELLED") {
					timeline.push({ time: new Date(a.updatedAt).toLocaleTimeString(), text: "Analysis cancelled by operator.", state: "failed" });
				} else if (a.status === "RUNNING") {
					timeline.push({ time: "Running", text: "AI agent analyzing content...", state: "current" });
				}

				// Build actions
				const actions = (a.agentPlan?.stepsRun || []).map((step, idx) => ({
					text: `Executed plan step: ${step}`,
					time: `Step ${idx + 1}`
				}));
				if (actions.length === 0 && a.status === "COMPLETED") {
					actions.push({ text: "Compliance checks complete. No policy deviations identified.", time: "Final" });
				}

				const output = {
					name: a.status === "COMPLETED" ? "Analysis_Report.json" : "—",
					type: a.status === "COMPLETED" ? "JSON" : "—",
					note: a.status === "COMPLETED" ? (a.result?.details || "No violations detected.") : "No output generated yet"
				};

				const audit = [
					{ text: `Task registered under Project: ${activeProject.name}`, time: createdDate.toLocaleString() }
				];
				if (a.completedAt) {
					audit.push({ text: "Task completion verified and logged in tamper-proof log", time: new Date(a.completedAt).toLocaleString() });
				}

				return {
					id: a._id,
					tab,
					name: `${a.type || "DOCUMENT"} Analysis Workflow`,
					description: a.instruction || "Analytical sweep of active documents.",
					status,
					statusLabel: statusLabelMap[a.status] || a.status,
					created: formattedDate,
					duration,
					owner: ownerName,
					ownerKind,
					tools: a.agentPlan?.stepsRun || ["shield"],
					progress,
					timeline,
					sources,
					actions,
					output,
					audit,
					error: a.status === "FAILED" ? (a.result?.details || "Unknown analysis execution failure") : null,
					waiting: a.status === "QUEUED",
					raw: a
				};
			});

			setRawTasks(mapped);
			setError(null);
		} catch (err) {
			console.error("[Tasks] Fetch failed:", err.message);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchTasks();
	}, [activeProject]);

	// Filter tasks dynamically
	const filteredTasks = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return rawTasks.filter((task) =>
			task.tab === activeTab &&
			(ownerFilter === "all" || task.ownerKind === ownerFilter) &&
			(dateFilter === "all" || task.created === dateFilter) &&
			`${task.name} ${task.id} ${task.owner}`.toLowerCase().includes(normalizedQuery)
		).sort((first, second) =>
			sortOrder === "name" ? first.name.localeCompare(second.name) : second.created.localeCompare(first.created)
		);
	}, [activeTab, dateFilter, ownerFilter, query, sortOrder, rawTasks]);

	// Count tabs dynamically
	const tabs = useMemo(() => [
		{ key: "active", label: "Active", count: rawTasks.filter((t) => t.tab === "active").length },
		{ key: "completed", label: "Completed", count: rawTasks.filter((t) => t.tab === "completed").length },
		{ key: "awaiting", label: "Awaiting Approval", count: rawTasks.filter((t) => t.tab === "awaiting").length },
		{ key: "failed", label: "Failed", count: rawTasks.filter((t) => t.tab === "failed").length },
	], [rawTasks]);

	const selectedTask = useMemo(() => {
		if (selectedId) {
			return filteredTasks.find((task) => task.id === selectedId) || filteredTasks[0];
		}
		return filteredTasks[0];
	}, [selectedId, filteredTasks]);

	function selectTab(key) {
		setActiveTab(key);
		setTaskAction("");
		const firstTask = rawTasks.find((task) => task.tab === key);
		if (firstTask) setSelectedId(firstTask.id);
	}

	async function handleCreateTask() {
		if (!activeProject) return;
		if (files.length === 0) {
			setTaskAction("Please upload/register a document before running analysis.");
			return;
		}

		const instruction = window.prompt(
			"Enter analysis instructions/prompt for the AI agent:",
			"Analyze the document for personal identifiable information (PII) leakage."
		);
		if (!instruction) return;

		try {
			setTaskAction("Initializing analysis task on backend...");
			// Use the first available file as input
			const fileId = files[0]._id;
			await analysesAPI.create(activeProject._id, {
				type: "DOCUMENT",
				instruction,
				inputFiles: [fileId]
			});
			setTaskAction("Task created successfully!");
			fetchTasks();
		} catch (err) {
			console.error("[Tasks] Creation failed:", err.message);
			setTaskAction(`Failed to create task: ${err.message}`);
		}
	}

	async function handleCancelTask(taskId) {
		if (!activeProject) return;
		try {
			setTaskAction("Sending cancellation request...");
			await analysesAPI.cancel(activeProject._id, taskId);
			setTaskAction("Task cancelled successfully.");
			fetchTasks();
		} catch (err) {
			console.error("[Tasks] Cancel failed:", err.message);
			setTaskAction(`Failed to cancel: ${err.message}`);
		}
	}

	async function handleRetryTask(taskId) {
		if (!activeProject) return;
		try {
			setTaskAction("Sending retry request...");
			await analysesAPI.retry(activeProject._id, taskId);
			setTaskAction("Task retry initiated.");
			fetchTasks();
		} catch (err) {
			console.error("[Tasks] Retry failed:", err.message);
			setTaskAction(`Failed to retry: ${err.message}`);
		}
	}

	const dates = useMemo(() => {
		const allDates = Array.from(new Set(rawTasks.map((t) => t.created)));
		return allDates.sort((a, b) => b.localeCompare(a));
	}, [rawTasks]);

	return (
		<main className="tasks-page">
			<header className="task-header">
				<div><p className="eyebrow">Operations / Workflows</p><h1>Task Operations</h1><p className="subtitle">Monitor and manage autonomous intelligence gathering and analytical workflows across sovereign data zones.</p></div>
				<div className="header-actions">
					<button className="button button-primary" type="button" onClick={handleCreateTask}><Plus size={16} /> New Task</button>
					<label className="select-control"><Filter size={15} /><span className="sr-only">Filter tasks by owner</span><select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option value="all">All owners</option><option value="agent">Agents</option><option value="system">System</option></select></label>
					<label className="select-control"><ArrowUpDown size={15} /><span className="sr-only">Sort tasks</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="created">Newest first</option><option value="name">Name A-Z</option></select></label>
				</div>
			</header>
			<nav className="task-tabbar" aria-label="Task status">{tabs.map((tab) => <button key={tab.key} type="button" className={`task-tab${activeTab === tab.key ? " active" : ""}`} onClick={() => selectTab(tab.key)}>{tab.label}<span>({tab.count})</span></button>)}</nav>
			<div className="tasks-layout">
				<section className="task-list-panel">
					<div className="tasks-toolbar">
						<label className="document-search task-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search task by name, ID, or Owner..." aria-label="Search tasks" /></label>
						<label className="select-control date-control"><CalendarRange size={15} /><span className="sr-only">Filter tasks by date</span><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option value="all">All dates</option>{dates.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
					</div>
					{loading ? (
						<p style={{ color: "#8f7768", padding: "24px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>Loading tasks…</p>
					) : (
						<div className="task-list">{filteredTasks.length === 0 ? <p className="empty-documents">No tasks match this view.</p> : filteredTasks.map((task) => <TaskRow task={task} selected={selectedTask?.id === task.id} onSelect={(selectedTaskItem) => { setSelectedId(selectedTaskItem.id); setTaskAction(""); }} onAction={setTaskAction} key={task.id} />)}</div>
					)}
				</section>
				{selectedTask && (
					<TaskDetail
						task={selectedTask}
						action={taskAction}
						onAction={setTaskAction}
						onCancel={() => handleCancelTask(selectedTask.id)}
						onRetry={() => handleRetryTask(selectedTask.id)}
					/>
				)}
			</div>
		</main>
	);
}

function TaskRow({ task, selected, onSelect, onAction }) {
	return <article className={`task-row${selected ? " selected" : ""}`} onClick={() => onSelect(task)}><div className="task-row-top"><h3>{task.name}</h3><span className={`task-pill ${task.status}`}>{task.statusLabel}</span></div><p className="task-row-desc">{task.description}</p><div className="task-row-meta"><span>Created: {task.created}</span><span>Duration: {task.duration}</span><span>Owner: {task.owner}</span></div><div className="task-row-footer"><div className="task-tools"><OwnerBadge kind={task.ownerKind} />{task.tools.map((tool) => { const Icon = TOOL_ICONS[tool] || ShieldCheck; return <span className="tool-chip" key={tool}><Icon size={12} /></span>; })}</div><button className="row-menu" type="button" aria-label={`Actions for ${task.name}`} onClick={(event) => { event.stopPropagation(); onAction(`Actions opened for ${task.name}.`); }}><MoreVertical size={16} /></button></div>{task.waiting && <p className="task-waiting">Waiting for resources</p>}</article>;
}

function OwnerBadge({ kind }) { return <span className={`owner-badge ${kind}`}>{kind === "system" ? <Cpu size={12} /> : <Bot size={12} />}</span>; }

function TaskDetail({ task, action, onAction, onCancel, onRetry }) {
	const canAbort = task.raw?.status === "QUEUED" || task.raw?.status === "RUNNING";
	const canRetry = task.raw?.status === "FAILED" || task.raw?.status === "CANCELLED";

	return <aside className="task-detail"><div className="detail-header"><div className="detail-title"><h2>{task.name}</h2><p>ID: {task.id}</p></div><button aria-label="Open full task" type="button"><ExternalLink size={17} /></button></div><div className="detail-body"><div className="detail-card task-overview"><h3>Task Overview</h3><div className="progress-heading"><span>Overall Progress</span><b>{task.progress}%</b></div><div className="confidence-track"><i style={{ width: `${task.progress}%` }} className={task.status === "failed" ? "muted" : ""} /></div><div className="detail-status-list"><div><span>Status</span><b>{task.statusLabel}</b></div><div><span>Owner</span><b>{task.owner}</b></div><div><span>Created</span><b>{task.created}</b></div><div><span>Duration</span><b>{task.duration}</b></div></div>{task.error && <p className="task-error"><AlertTriangle size={13} /> {task.error}</p>}</div><div className="detail-card"><h3>Execution Timeline</h3><div className="exec-timeline">{task.timeline.map((step, index) => <TimelineStep step={step} key={index} />)}</div></div><div className="detail-card"><h3>Sources</h3><div className="source-list">{task.sources.map((source) => <article className="source-card" key={source.name}><div className={`source-label ${source.tone}`}>{source.label} <ExternalLink size={12} /></div><strong>{source.name}</strong><span>{source.detail}</span></article>)}</div></div><div className="detail-card"><h3>Agent Actions &amp; Tool Calls</h3><ul className="tool-call-list">{task.actions.map((entry, index) => <li key={index}><Wrench size={13} /><div><p>{entry.text}</p><time>{entry.time}</time></div></li>)}</ul></div><div className="detail-card output-card"><h3>Generated Output</h3><div className="output-row"><span className="output-icon"><FileText size={18} /></span><div><strong>{task.output.name}</strong><span>{task.output.note}</span></div>{task.output.type !== "—" && <button className="output-download" type="button" aria-label="Download output"><Download size={16} /></button>}</div></div><div className="detail-card audit-log"><h3>Audit Information</h3><div>{task.audit.map((entry, index) => <span key={index}>{entry.text}<small>{entry.time}</small></span>)}</div></div></div>{action && <p className="task-action-feedback" role="status">{action}</p>}
		<div className="detail-footer-actions">
			{canAbort && <button className="button button-secondary" type="button" onClick={onCancel}>Abort Task</button>}
			{canRetry && <button className="button button-primary" type="button" onClick={onRetry}>Retry Task</button>}
			<button className="button button-secondary" type="button" onClick={() => onAction("Loading agent logs...")}><ChevronRight size={15} /> View Agent Logs</button>
		</div>
	</aside>;
}

function TimelineStep({ step }) {
	return <div className={`exec-step ${step.state}`}><span className="exec-step-dot">{step.state === "done" && <Check size={10} />}{step.state === "current" && <Loader2 size={10} />}{step.state === "failed" && <AlertTriangle size={9} />}</span><div className="exec-step-body"><div className="exec-step-head"><span className="exec-step-time">{step.time}</span>{step.state === "current" && <span className="exec-step-tag">Current Phase</span>}{step.state === "done" && <CheckCircle2 size={13} className="exec-step-check" />}</div><p>{step.text}</p>{step.sources && <div className="exec-refs"><span className="exec-refs-label">Referencing sources:</span><div className="exec-refs-list">{step.sources.map((source) => <span className="exec-ref-chip" key={source}><FileText size={12} /> {source}</span>)}</div></div>}</div></div>;
}

export default Tasks;
