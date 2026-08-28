import { useMemo, useState } from "react";
import { BookOpen, Database, FileText, FolderOpen, Plus, Search, ShieldCheck, Sparkles } from "lucide-react";

const collections = [
	{ name: "Safety Protocols 2024", description: "Operational procedures and hazard response guidance.", sources: 184, updated: "Updated 12 min ago", tone: "orange" },
	{ name: "Facility Q3", description: "Inspection reports, sensor readings, and site observations.", sources: 142, updated: "Updated 1 hour ago", tone: "teal" },
	{ name: "Corporate Policies", description: "Approved policies for governance, security, and compliance.", sources: 96, updated: "Updated yesterday", tone: "blue" },
	{ name: "Research Archive", description: "Reference material and historical intelligence for analysis.", sources: 129, updated: "Updated 3 days ago", tone: "plum" },
];

const activity = [
	["Knowledge base sync complete", "Facility Q3", "3 hours ago"],
	["3 documents indexed", "Safety Protocols 2024", "Yesterday"],
	["Collection permissions updated", "Corporate Policies", "Yesterday"],
];

function KnowledgeHub() {
	const [query, setQuery] = useState("");
	const [created, setCreated] = useState(false);
	const [openedCollection, setOpenedCollection] = useState("");
	const filteredCollections = useMemo(() => collections.filter((collection) => `${collection.name} ${collection.description}`.toLowerCase().includes(query.toLowerCase())), [query]);

	return (
		<main className="knowledge-page">
			<header className="knowledge-header">
				<div>
					<p className="eyebrow"><BookOpen size={14} /> Curated intelligence</p>
					<h1>Knowledge Hub</h1>
					<p className="subtitle">Organize the sources your sovereign AI can trust.</p>
				</div>
				{/* Backend connection point: POST /api/knowledge/collections. */}
				<button className="button button-primary" type="button" onClick={() => setCreated(true)}><Plus size={17} /> New collection</button>
			</header>
			{created && <div className="export-feedback" role="status">New collection form is ready in this mock workspace.</div>}
			{openedCollection && <div className="export-feedback" role="status">{openedCollection} collection opened.</div>}

			<section className="knowledge-toolbar" aria-label="Knowledge tools">
				<div className="knowledge-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search collections or descriptions..." aria-label="Search collections" /></div>
				<div className="knowledge-total"><Database size={16} /><strong>551</strong><span>sources indexed</span></div>
			</section>

			<div className="knowledge-layout">
				<section className="collection-section">
					<div className="section-heading"><div><p className="eyebrow">Workspace library</p><h2>Collections</h2></div><span>{filteredCollections.length} available</span></div>
					<div className="collection-grid">
						{filteredCollections.map((collection) => <CollectionCard collection={collection} onOpen={setOpenedCollection} key={collection.name} />)}
					</div>
					{filteredCollections.length === 0 && <p className="knowledge-empty">No collections match your search.</p>}
				</section>

				<aside className="knowledge-sidebar">
					<section className="knowledge-panel">
						<div className="panel-heading"><h2>Index health</h2><ShieldCheck size={18} className="heading-icon" /></div>
						<div className="index-health"><span className="health-ring"><span>98%</span></span><div><strong>Healthy</strong><p>Last full sync 12 min ago</p></div></div>
						<div className="health-stat"><span>Embedded sources</span><b>551 / 551</b></div>
						<div className="health-stat"><span>Pending updates</span><b>12</b></div>
					</section>
					<section className="knowledge-panel activity-panel-small"><div className="panel-heading"><h2>Recent activity</h2><Sparkles size={18} className="heading-icon" /></div><ul className="knowledge-activity">{activity.map(([event, collection, time]) => <li key={`${event}-${collection}`}><span className="activity-dot success" /><div><strong>{event}</strong><span>{collection}</span><time>{time}</time></div></li>)}</ul></section>
				</aside>
			</div>
		</main>
	);
}

function CollectionCard({ collection, onOpen }) {
	return <article className="collection-card"><div className={`collection-icon ${collection.tone}`}><FolderOpen size={21} /></div><div className="collection-card-body"><div className="collection-card-title"><h3>{collection.name}</h3><button type="button" aria-label={`Open ${collection.name}`} onClick={() => onOpen(collection.name)}><FileText size={16} /></button></div><p>{collection.description}</p><div className="collection-meta"><span><Database size={14} /> {collection.sources} sources</span><time>{collection.updated}</time></div></div></article>;
}

export default KnowledgeHub;
