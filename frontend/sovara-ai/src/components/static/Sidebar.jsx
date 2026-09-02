import { NavLink } from "react-router-dom";
import { CheckSquare, ClipboardCheck, FileText, LayoutDashboard, LibraryBig, ListChecks, LockKeyhole, Settings, Shield, Sparkles } from "lucide-react";
import logo from "../../assets/logo.png";

const navItems = [
  {
    label: "Main",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "AI Workspace",
        path: "/dashboard/workspace",
        icon: Sparkles,
      },
      {
        name: "Tasks",
        path: "/dashboard/tasks",
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Knowledge",
    items: [
      {
        name: "Knowledge Hub",
        path: "/dashboard/knowledge",
        icon: LibraryBig,
      },
      {
        name: "Documents",
        path: "/documents",
        icon: FileText,
      },
    ],
  },
  {
    label: "Outputs",
    items: [
      {
        name: "Deliverables",
        path: "/deliverables",
        icon: CheckSquare,
      },
      {
        name: "Approvals",
        path: "/approvals",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        name: "Security Center",
        path: "/security",
        icon: Shield,
      },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="app-sidebar">

      {/* Logo / Brand */}
      <div className="brand-block">
        <div className="brand-row">
          <span className="brand-mark">
            <img src={logo} alt="SOVARA AI Logo" />
          </span>
          <div>
            <div className="brand-name">SOVARA AI</div>
            <div className="brand-caption">Sovereign Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        {navItems.map((group) => (
          <div key={group.label}>

            {/* Group title */}
            <div className="nav-group-label">
              {group.label}
            </div>

            {/* Group links */}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                title={item.name}
              >
                <item.icon size={18} strokeWidth={1.8} />

                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        ))}

        <div className="settings-link-wrap">
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            title="Settings"
          >
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Local Processing Status */}
      <div className="processing-status">
        <div className="system-state"><span className="status-indicator"></span><span>Local AI Online</span></div>
        <div className="system-state"><LockKeyhole size={12} /><span>Security Active</span></div>
      </div>

    </aside>
  );
}

export default Sidebar;