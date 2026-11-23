
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { register, refreshUser } = useAuth();

  const [accountType, setAccountType] = useState("attendee");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicationError, setApplicationError] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizerType: "Individual",
    organizationName: "",
    contactNumber: "",
    organizerExperience: "First time",
    organizerWebsite: ""
  });

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setApplicationError(false);

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (
      accountType === "organizer" &&
      !/^[0-9+\-\s()]{7,20}$/.test(form.contactNumber.trim())
    ) {
      setError("Please enter a valid contact number.");
      return;
    }

    if (
      accountType === "organizer" &&
      form.organizerType === "Organization" &&
      !form.organizationName.trim()
    ) {
      setError("Please enter your organization name.");
      return;
    }

    setLoading(true);

    try {
      // Create the account and save the authentication token.
      await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );

      setCreatedAccount(true);

      if (accountType === "organizer") {
        try {
          // Submit the organizer application.
          await api.post("/auth/apply-organizer", {
            organizerType: form.organizerType,
            organizationName: form.organizationName.trim(),
            contactNumber: form.contactNumber.trim(),
            organizerExperience: form.organizerExperience,
            organizerWebsite: form.organizerWebsite.trim()
          });

          // Fetch the updated user from the backend.
          const updatedUser = await refreshUser();

          if (
            updatedUser.organizerStatus === "pending" ||
            updatedUser.organizerStatus === "rejected"
          ) {
            navigate("/organizer/application-status", {
              replace: true
            });
          } else {
            setError(
              "Your application was submitted, but its status could not be confirmed. Please sign in again."
            );
          }
        } catch (err) {
          console.error("Organizer application error:", err);

          setApplicationError(true);
          setError(
            err.response?.data?.message ||
            "Your account was created, but your organizer application could not be submitted. Please contact the administrator."
          );
        }
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">E</span>
          <span>EventEase</span>
        </Link>

        <div className="auth-heading">
          <p className="auth-eyebrow">JOIN THE EXPERIENCE</p>
          <h1>Create your account</h1>
          <p>Discover events, meet people and create experiences.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Account type</label>

            <div className="account-type-options">
              <button
                type="button"
                className={`account-type-option ${
                  accountType === "attendee" ? "active" : ""
                }`}
                onClick={() => {
                  if (!createdAccount) {
                    setAccountType("attendee");
                    setError("");
                  }
                }}
                disabled={createdAccount}
              >
                <User size={19} />
                <span>
                  <strong>Attendee</strong>
                  <small>Discover and book events</small>
                </span>
              </button>

              <button
                type="button"
                className={`account-type-option ${
                  accountType === "organizer" ? "active" : ""
                }`}
                onClick={() => {
                  if (!createdAccount) {
                    setAccountType("organizer");
                    setError("");
                  }
                }}
                disabled={createdAccount}
              >
                <Building2 size={19} />
                <span>
                  <strong>Organizer</strong>
                  <small>Host and manage events</small>
                </span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                minLength={2}
                maxLength={60}
                required
                disabled={createdAccount}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={createdAccount}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
                disabled={createdAccount}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {accountType === "organizer" && !createdAccount && (
            <div className="organizer-registration-section">
              <div className="organizer-registration-note">
                <Building2 size={19} />
                <div>
                  <strong>Organizer details</strong>
                  <p>
                    Create your account now. Organizer features will become
                    available after administrator approval.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="organizerType">Organizer type</label>
                <select
                  id="organizerType"
                  name="organizerType"
                  value={form.organizerType}
                  onChange={handleChange}
                  required
                >
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>

              {form.organizerType === "Organization" && (
                <div className="form-group">
                  <label htmlFor="organizationName">
                    Organization / brand name
                  </label>
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    placeholder="Enter organization name"
                    value={form.organizationName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="contactNumber">Contact number</label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  placeholder="Enter contact number"
                  value={form.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizerExperience">
                  Organizing experience
                </label>
                <select
                  id="organizerExperience"
                  name="organizerExperience"
                  value={form.organizerExperience}
                  onChange={handleChange}
                  required
                >
                  <option value="First time">First time</option>
                  <option value="1–3 years">1–3 years</option>
                  <option value="3+ years">3+ years</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="organizerWebsite">
                  Website / social media link (optional)
                </label>
                <input
                  id="organizerWebsite"
                  name="organizerWebsite"
                  type="url"
                  placeholder="https://example.com"
                  value={form.organizerWebsite}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {applicationError && (
            <p className="form-helper-text">
              Your account already exists. Do not register again.
              Please contact the administrator to resolve the application.
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || applicationError || createdAccount}
          >
            {loading
              ? "Creating account..."
              : accountType === "organizer"
                ? "Create organizer account"
                : "Create attendee account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>

        <p className="auth-terms">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </section>
    </main>
  );
}
