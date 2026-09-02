import { useAuth } from "../context/AuthContext";
import { UserCircle2, Mail, Briefcase, BadgeCheck } from "lucide-react";

function Profile() {
  const { user } = useAuth();

  const profile = {
    name: user?.name || "Alex Morgan",
    email: user?.email || "alex@company.test",
    employeeId: user?.employeeId || "alex123",
    role: user?.role || "Employee",
  };

  return (
    <main className="account-page">
      <header className="account-header">
        <div>
          <p className="workspace-label">Identity / Account</p>
          <h1>Profile</h1>
        </div>
      </header>

      <section className="account-panel profile-panel">
        <div className="profile-hero">
          <div className="profile-avatar"><UserCircle2 size={52} /></div>
          <div>
            <h2>{profile.name}</h2>
            <p><BadgeCheck size={15} /> {profile.role}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <Mail size={18} />
            <div><small>Email</small><strong>{profile.email}</strong></div>
          </div>
          <div className="profile-item">
            <Briefcase size={18} />
            <div><small>Employee ID</small><strong>{profile.employeeId}</strong></div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;
