import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { usersAPI } from "../services/api";
import logo from "../assets/logo.png";
import "./Login.css";

const initialForm = {
  name: "",
  email: "",
  employeeId: "",
  department: "",
  role: "EMPLOYEE",
};

export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await usersAPI.create(form);
      setSuccessMessage("User created successfully. Default password: employeeId@Change123");
      setForm(initialForm);
    } catch (err) {
      setErrorMessage(err?.data?.message || err?.message || "Unable to create user.");
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
                <span className="brand-subtitle">User Provisioning</span>
              </div>
            </div>
            <div className="security-tag">
              <ShieldCheck size={14} className="security-icon" />
              <span>Authorized Access</span>
            </div>
          </div>

          <div className="login-welcome">
            <h2>Create new user</h2>
            <p>Create employee, supervisor, or admin accounts inside the enclave.</p>
          </div>

          {errorMessage && (
            <div className="login-error-banner">
              <AlertCircle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="login-success-banner">
              <CheckCircle2 size={18} className="success-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-field-wrap">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Employee"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-field-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="employeeId">Employee ID</label>
              <div className="input-field-wrap">
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="EMP104"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <div className="input-field-wrap">
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Operations"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <div className="input-field-wrap">
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="login-select"
                  disabled={isSubmitting}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating user..." : "Create User"}
            </button>
          </form>

          <div className="auth-link-row">
            <button type="button" className="secondary-link-btn" onClick={() => navigate("/dashboard")}>
              Back to dashboard
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
