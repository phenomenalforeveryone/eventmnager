
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Heart,
  Ticket,
  UserRound,
  Settings,
  LockKeyhole,
  Mail,
  CalendarDays,
  Save,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./UserProfile.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    interests: []
  });
  const [interestInput, setInterestInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const fetchProfile = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/users/profile");
      const data = response.data.user;

      setProfile({
        name: data.name || "",
        email: data.email || "",
        interests: data.interests || []
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to load your profile."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleAddInterest = (event) => {
    event.preventDefault();

    const value = interestInput.trim();

    if (!value) return;

    if (profile.interests.some(
      (interest) => interest.toLowerCase() === value.toLowerCase()
    )) {
      setMessage("This interest has already been added.");
      setMessageType("error");
      return;
    }

    setProfile((previous) => ({
      ...previous,
      interests: [...previous.interests, value]
    }));

    setInterestInput("");
    setMessage("");
  };

  const handleRemoveInterest = (value) => {
    setProfile((previous) => ({
      ...previous,
      interests: previous.interests.filter(
        (interest) => interest !== value
      )
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (profile.name.trim().length < 2) {
      setMessage("Name must contain at least 2 characters.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await api.put("/users/profile", {
        name: profile.name.trim(),
        interests: profile.interests
      });

      const updatedUser = response.data.user;

      setProfile({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        interests: updatedUser.interests || []
      });

      setMessage("Your profile has been updated successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to save profile changes."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const resetProfile = () => {
    fetchProfile();
  };

  const firstName = profile.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <div
          className="profile-brand"
          onClick={() => navigate("/events")}
        >
          <div className="profile-brand-icon">E</div>
          <div>
            <h2>EventEase</h2>
            <span>YOUR EXPERIENCE HUB</span>
          </div>
        </div>

        <span className="profile-nav-heading">MENU</span>

        <button onClick={() => navigate("/dashboard")}>
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button onClick={() => navigate("/events")}>
          <Compass size={18} /> Explore Events
        </button>

        <button onClick={() => navigate("/user/saved")}>
          <Heart size={18} /> Saved Events
        </button>

        <button onClick={() => navigate("/user/bookings")}>
          <Ticket size={18} /> My Bookings
        </button>

        <button onClick={() => navigate("/user/tickets")}>
          <CalendarDays size={18} /> My Tickets
        </button>

        <button className="active">
          <UserRound size={18} /> My Profile
        </button>

        <div className="profile-sidebar-bottom">
          <div className="profile-sidebar-user">
            <div className="profile-avatar-small">{firstName}</div>
            <div>
              <strong>{profile.name || user?.name || "EventEase User"}</strong>
              <span>{user?.role || "Attendee"} Account</span>
            </div>
          </div>

          <button className="profile-logout" onClick={handleLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="profile-main">
        <header className="profile-topbar">
          <div>
            <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
            <h1>My Profile<span>.</span></h1>
            <p>Manage your personal information and account security.</p>
          </div>

          <button
            className="profile-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
        </header>

        <section className="profile-hero">
          <div className="profile-hero-avatar">
            {firstName}
          </div>

          <div className="profile-hero-info">
            <h2>{profile.name || "Your Name"}</h2>
            <p>{profile.email || user?.email}</p>
            <span className="profile-member-badge">
              <ShieldCheck size={14} /> Active Account
            </span>
          </div>

          <div className="profile-hero-mark">E.</div>
        </section>

        <div className="profile-tabs">
          <button
            className={activeTab === "profile" ? "selected" : ""}
            onClick={() => {
              setActiveTab("profile");
              setMessage("");
            }}
          >
            <UserRound size={17} /> Personal Information
          </button>

          <button
            className={activeTab === "security" ? "selected" : ""}
            onClick={() => {
              setActiveTab("security");
              setMessage("");
            }}
          >
            <LockKeyhole size={17} /> Security
          </button>

          <button
            className={activeTab === "settings" ? "selected" : ""}
            onClick={() => {
              setActiveTab("settings");
              setMessage("");
            }}
          >
            <Settings size={17} /> Account
          </button>
        </div>

        {message && (
          <div className="profile-message">
            {message}
          </div>
        )}

        {loading ? (
          <section className="profile-panel">
            <RefreshCw size={22} />
            <p>Loading your account information...</p>
          </section>
        ) : (
          <>
            {activeTab === "profile" && (
              <section className="profile-panel">
                <div className="profile-panel-heading">
                  <div>
                    <h2>Personal Information</h2>
                    <p>Update the information stored in your account.</p>
                  </div>
                  <UserRound size={22} />
                </div>

                <form onSubmit={handleProfileSave}>
                  <div className="profile-form-grid">
                    <div className="profile-field">
                      <label>Full Name</label>
                      <div className="profile-input-wrap">
                        <UserRound size={17} />
                        <input
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          placeholder="Enter your full name"
                          minLength={2}
                          maxLength={60}
                          required
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Email Address</label>
                      <div className="profile-input-wrap">
                        <Mail size={17} />
                        <input
                          type="email"
                          value={profile.email}
                          readOnly
                        />
                      </div>
                      <small>Email editing is currently disabled.</small>
                    </div>

                    <div className="profile-field full-width">
                      <label>Your Interests</label>
                      <div className="profile-input-wrap">
                        <input
                          value={interestInput}
                          onChange={(event) =>
                            setInterestInput(event.target.value)
                          }
                          placeholder="Add an interest, e.g. Technology"
                          maxLength={40}
                        />
                        <button
                          type="button"
                          onClick={handleAddInterest}
                          style={{
                            border: "none",
                            background: "#173d2e",
                            color: "#fff",
                            padding: "9px 13px",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                        >
                          Add
                        </button>
                      </div>

                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "12px"
                      }}>
                        {profile.interests.map((interest) => (
                          <span
                            key={interest}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "7px 11px",
                              background: "#edf1e8",
                              color: "#315b3f",
                              borderRadius: "20px",
                              fontSize: "12px"
                            }}
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interest)}
                              aria-label={`Remove ${interest}`}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#315b3f",
                                cursor: "pointer",
                                fontWeight: "bold"
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-btn"
                      onClick={resetProfile}
                      disabled={saving}
                    >
                      Reset
                    </button>

                    <button
                      type="submit"
                      className="profile-save-btn"
                      disabled={saving}
                    >
                      <Save size={17} />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === "security" && (
              <section className="profile-panel">
                <div className="profile-panel-heading">
                  <div>
                    <h2>Password & Security</h2>
                    <p>Information about your account protection.</p>
                  </div>
                  <LockKeyhole size={22} />
                </div>

                <div className="profile-security-note">
                  <ShieldCheck size={21} />
                  <div>
                    <strong>Your account is protected</strong>
                    <p>
                      Your password is securely hashed by the backend.
                      Password changes are not yet available in this version.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "settings" && (
              <section className="profile-panel">
                <div className="profile-panel-heading">
                  <div>
                    <h2>Account Settings</h2>
                    <p>Review your account information and status.</p>
                  </div>
                  <Settings size={22} />
                </div>

                <div className="profile-account-list">
                  <div className="profile-account-item">
                    <div className="profile-account-icon">
                      <Mail size={19} />
                    </div>
                    <div>
                      <strong>Email Address</strong>
                      <span>{profile.email || "Not available"}</span>
                    </div>
                  </div>

                  <div className="profile-account-item">
                    <div className="profile-account-icon">
                      <ShieldCheck size={19} />
                    </div>
                    <div>
                      <strong>Account Role</strong>
                      <span>{user?.role || "User"}</span>
                    </div>
                  </div>

                  <div className="profile-account-item">
                    <div className="profile-account-icon">
                      <CalendarDays size={19} />
                    </div>
                    <div>
                      <strong>Account Status</strong>
                      <span>Active</span>
                    </div>
                  </div>
                </div>

                <div className="profile-danger-zone">
                  <div>
                    <h3>Sign out of EventEase</h3>
                    <p>End your current session on this device.</p>
                  </div>

                  <button onClick={handleLogout}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        <footer className="profile-footer">
          <span>EVENTEASE © 2026</span>
          <span>Every experience begins with you.</span>
        </footer>
      </main>
    </div>
  );
}
