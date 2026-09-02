import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { authAPI } from "../services/api";
import logo from "../assets/logo.png";
import "./Login.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setErrorMessage("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await authAPI.forgotPassword(email.trim());
      setMessage("If that account exists, a reset link has been generated and sent.");
      setEmail("");
    } catch (err) {
      setErrorMessage(err?.data?.message || err?.message || "Unable to process the reset request.");
    } finally {
      setIsSubmitting(false);
    }
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
                <span className="brand-subtitle">Password Recovery</span>
              </div>
            </div>
            <div className="security-tag">
              <ShieldCheck size={14} className="security-icon" />
              <span>Secure Reset</span>
            </div>
          </div>

          <div className="login-welcome">
            <h2>Reset your password</h2>
            <p>Enter the email linked to your account to receive a reset request.</p>
          </div>

          {errorMessage && (
            <div className="login-error-banner">
              <AlertCircle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {message && (
            <div className="login-success-banner">
              <CheckCircle2 size={18} className="success-icon" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-field-wrap">
                <Mail size={18} className="field-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending reset..." : "Send Reset Link"}
            </button>
          </form>

          <div className="auth-link-row">
            <button type="button" className="secondary-link-btn" onClick={() => navigate("/login")}>
              <ArrowLeft size={15} />
              Back to login
            </button>
          </div>

          <div className="login-footer">
            <p>Protected by end-to-end local encryption & zero-trust compliance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
