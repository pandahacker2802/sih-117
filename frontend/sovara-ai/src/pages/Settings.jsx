import { useState } from "react";
import { Save } from "lucide-react";
import { settings } from "../data/mockData";

function Settings() {
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState(() => Object.fromEntries(settings.map(([label, , enabled]) => [label, enabled])));

  return (
    <main className="account-page">
      <header className="account-header"><div><p className="workspace-label">System / Preferences</p><h1>Settings</h1><p>Control workspace behavior and local processing preferences.</p></div>{/* Backend connection point: PATCH /api/settings with selected preference values. */}<button className="button button-primary" type="button" onClick={() => setSaved(true)}><Save size={16} /> Save changes</button></header>
      {saved && <div className="export-feedback" role="status">Workspace preferences saved locally.</div>}
      <section className="account-panel settings-panel"><div className="security-panel-heading"><h2>Workspace preferences</h2><span className="audit-badge">LOCAL CONFIG</span></div>{settings.map(([label, description, , Icon]) => <label className="setting-row" key={label}><span className="setting-icon"><Icon size={17} /></span><span className="setting-copy"><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={preferences[label]} onChange={(event) => { setSaved(false); setPreferences({ ...preferences, [label]: event.target.checked }); }} /></label>)}</section>
    </main>
  );
}

export default Settings;
