import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles, KeyRound, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "./Login.css";

const PRESET_ACCOUNTS = [
  {
    role: "System Admin",
    identifier: "admin@example.com",
    password: "SystemAdmin@2026",
    color: "#ffb784",
  },
  {
    role: "Supervisor",
    identifier: "EMP003",
    password: "BobSupervisor@2026",
    color: "#a1c4fd",
  },
  {
    role: "Employee",
    identifier: "EMP002",
    password: "JaneEmployee@2026",
    color: "#c2e9fb",
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!identifier || !password) {
      setErrorMessage("Please enter your email or employee ID and password.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(identifier, password);
      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err?.data?.message || err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillPreset = (preset) => {
    setIdentifier(preset.identifier);
    setPassword(preset.password);
    setErrorMessage("");
  };

  return (
    <div className="login-container">
      <div className="login-glow-1"></div>
      <div className="login-glow-2"></div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand">
              <div className="brand-logo-glow">
                <img src={logo} alt="SOVARA AI Logo" className="login-logo-img" />
              </div>
              <div className="brand-text-block">
                <span className="brand-title">SOVARA AI</span>
                <span className="brand-subtitle">Sovereign Intelligence Platform</span>
              </div>
            </div>
            <div className="security-tag">
              <ShieldCheck size={14} className="security-icon" />
              <span>PS117 Enclave Protected</span>
            </div>
          </div>

          <div className="login-welcome">
            <h2>Welcome back</h2>
            <p>Sign in to access your secure sovereign workspace and AI agents.</p>
          </div>

          {errorMessage && (
            <div className="login-error-banner">
              <AlertCircle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="identifier">Email Address / Employee ID</label>
              <div className="input-field-wrap">
                <UserRound size={18} className="field-icon" />
                <input
                  id="identifier"
                  type="text"
                  placeholder="admin@example.com or EMP003"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
              </div>
              <div className="input-field-wrap">
                <Lock size={18} className="field-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-link-row">
              <button type="button" className="secondary-link-btn" onClick={() => navigate("/forgot-password")}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="btn-spinner-wrap">
                  <div className="btn-spinner"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="preset-login-section">
            <div className="preset-title">
              <KeyRound size={14} />
              <span>Quick Test Accounts</span>
            </div>
            <div className="preset-chips-grid">
              {PRESET_ACCOUNTS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  className="preset-chip"
                  onClick={() => fillPreset(preset)}
                >
                  <Sparkles size={13} style={{ color: preset.color }} />
                  <span>{preset.role}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="login-footer">
            <p>Protected by end-to-end local encryption & zero-trust compliance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}