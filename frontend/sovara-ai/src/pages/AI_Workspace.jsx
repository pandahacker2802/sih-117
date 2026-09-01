import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, FileText, Folder, Paperclip, Send, Wrench, ExternalLink, Database, Plus } from "lucide-react";
import { workspaceDocuments as defaultDocuments, workspaceSources as sources } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { filesAPI } from "../services/api";

const AI_AGENT_URL = import.meta.env.VITE_AI_AGENT_URL || "http://localhost:3001";

function AIWorkspace() {
	const { activeProject } = useAuth();
	const [prompt, setPrompt] = useState("");
	const [sentPrompt, setSentPrompt] = useState("");
	const [attachment, setAttachment] = useState("");
	const [loading, setLoading] = useState(false);
	const [documents, setDocuments] = useState(defaultDocuments);
	const [assistantResponse, setAssistantResponse] = useState("");
	const loadingTimer = useRef(null);

	useEffect(() => {
		async function fetchFiles() {
			if (!activeProject) return;
			try {
				const res = await filesAPI.list(activeProject._id);
				const files = res.data?.files || res.data || [];
				if (files.length > 0) {
					setDocuments(files.map((f) => f.originalName || f.filename));
				}
			} catch (err) {
				console.error("[AIWorkspace] Failed to fetch project files:", err.message);
			}
		}
		fetchFiles();
	}, [activeProject]);

	async function submitPrompt(event) {
		event.preventDefault();
		if (!prompt.trim()) return;
		
		const userPrompt = prompt.trim();
		setSentPrompt(userPrompt);
		setPrompt("");
		setLoading(true);
		setAssistantResponse("");

		try {
			// Call AI Agent API with Gemma LLM
			const response = await fetch(`${AI_AGENT_URL}/api/generate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ 
					topic: userPrompt,
					tone: "analytical",
					useLLM: true 
				}),
			});

			if (!response.ok) {
				throw new Error(`AI Agent error: ${response.status}`);
			}

			const data = await response.json();
			
			// Format the response from Gemma
			if (data.success && data.variations && data.variations.length > 0) {
				const analysis = data.variations
					.map((v) => `${v.hook}\n\n${v.body}`)
					.join("\n\n---\n\n");
				setAssistantResponse(analysis);
			} else {
				setAssistantResponse("Analysis generated successfully. Ready for further queries.");
			}
		} catch (err) {
			console.error("[AIWorkspace] Gemma API error:", err);
			setAssistantResponse("Analysis service temporarily unavailable. Displaying mock analysis...\n\nBased on the inspection report, several critical findings were identified in Sector G including ventilation system failures and storage protocol breaches.");
		} finally {
			setLoading(false);
			window.clearTimeout(loadingTimer.current);
		}
	}

	return (
		<main className="workspace-page">
			<aside className="workspace-context">
				<div className="workspace-context-heading"><div><p className="workspace-label">Current context</p><strong>Analyze Inspection Report #042</strong></div><button className="workspace-new-button" type="button" aria-label="Create new workspace" onClick={() => { setPrompt(""); setSentPrompt(""); setAttachment(""); }}><Plus size={16} /></button></div>
				<div className="workspace-context-body">
					<section className="workspace-side-section"><h2><Folder size={16} /> Attached documents</h2><div className="document-list">{documents.map((document) => <button className="document-item" type="button" onClick={() => setPrompt((current) => `${current}${current ? " " : ""}Analyze ${document}.`)} key={document}><FileText size={18} /><span>{document}</span></button>)}</div></section>
					<section className="workspace-side-section"><h2><Database size={16} /> Knowledge collections</h2><div className="collection-list"><span>Safety Protocols 2024</span><span>Facility Q3</span></div></section>
				</div>
			</aside>

			<section className="workspace-conversation">
				<div className="chat-area">
					<p className="workspace-label">Analysis session</p>
					<h1>Analysis Session</h1>
					<div className="user-message">Summarize the safety issues identified in the recent inspection and map them to our current protocols.</div>
					{sentPrompt && <div className="user-message follow-up">{sentPrompt}</div>}
					{loading ? <ChatLoading /> : <div className="assistant-message">
						<p>Based on a review of <button className="inline-reference" type="button" onClick={() => setPrompt("Review Inspection_Report_042.pdf in detail.")}>Inspection_Report_042.pdf</button>, several key safety deviations were noted, primarily concerning equipment storage and ventilation in Sector G.</p>
						<p>According to <button className="inline-reference" type="button" onClick={() => setPrompt("Explain SOP-17.pdf section 4.2.")}>[SOP-17.pdf §4.2]</button>, “All highly reactive materials must be stored in specialized containment units with active ventilation.” The report indicates that temporary storage units were utilized for a duration exceeding the 48-hour limit.</p>
						<ul><li><strong>Ventilation Failure:</strong> The secondary extraction fan in Sector G was operating at 40% capacity.</li><li><strong>Storage Protocol Breach:</strong> Reactive compounds remained in transit staging for 72 hours.</li></ul>
						<p>I can draft an incident response memo outlining immediate corrective actions if needed.</p>
					</div>}
				</div>
				<form className="workspace-composer" onSubmit={submitPrompt}>
					<textarea value={prompt} disabled={loading} onChange={(event) => setPrompt(event.target.value)} placeholder={loading ? "Sovara is reviewing the evidence..." : "Direct the analysis..."} rows="3" />
					<div className="composer-toolbar"><div><label className="composer-tool-button"><input type="file" disabled={loading} hidden onChange={(event) => setAttachment(event.target.files?.[0]?.name || "")} /><Paperclip size={15} /> {attachment || "Attach"}</label><button type="button" disabled={loading} onClick={() => setPrompt((current) => `${current}${current ? " " : ""}Use the relevant knowledge collections.`)}><BookOpen size={15} /> Knowledge</button><button type="button" disabled={loading} onClick={() => setPrompt((current) => `${current}${current ? " " : ""}Use available analysis tools.`)}><Wrench size={15} /> Tools</button></div><button className="send-button" disabled={loading} type="submit" aria-label="Send prompt"><Send size={17} /></button></div>
				</form>
			</section>

			<aside className="workspace-trace">
				<p className="workspace-label">Trace &amp; sources</p>
				<div className="trace-list"><TraceItem text="Understanding request parameters" done /><TraceItem text="Searching knowledge base for 'Sector G'" done /><TraceItem text="Reviewing evidence" active /></div>
				<div className="source-list">{sources.map(([label, name, detail, tone]) => <article className="source-card" key={name}><div className={`source-label ${tone}`}>{label}<ExternalLink size={13} /></div><strong>{name}</strong><span>{detail}</span></article>)}</div>
			</aside>
		</main>
	);
}

function ChatLoading() {
	return <div className="assistant-message chat-loading" role="status" aria-label="Sovara is generating a response"><div className="loading-label"><span className="jiggling-dots"><i /><i /><i /></span><span>Sovara is thinking</span></div><div className="skeleton-lines" aria-hidden="true"><i /><i /><i className="short" /></div></div>;
}

function TraceItem({ text, done, active }) {
	return <div className={`trace-item${active ? " active" : ""}`}><span>{done ? <Check size={10} /> : <i />}</span><div>{text}</div></div>;
}

export default AIWorkspace;
