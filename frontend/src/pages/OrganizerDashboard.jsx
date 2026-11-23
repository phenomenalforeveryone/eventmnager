
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Plus,
  Users,
  TrendingUp,
  Ticket,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  LogOut,
  RefreshCw,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./OrganizerDashboard.css";

export default function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch organizer events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events/my-events");
      const data = response.data;

      setEvents(
        Array.isArray(data)
          ? data
          : data.events || data.data?.events || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Delete event
  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/events/${eventId}`);

      setEvents((previous) =>
        previous.filter((event) => event._id !== eventId)
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Could not delete event."
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Dashboard statistics
  const approved = events.filter(
    (event) => event.approvalStatus === "approved"
  ).length;

  const pending = events.filter(
    (event) => event.approvalStatus === "pending"
  ).length;

  const totalCapacity = events.reduce(
    (sum, event) => sum + Number(event.capacity || 0),
    0
  );

  // Event approval status
  const getStatus = (status) => {
    if (status === "approved") {
      return {
        label: "Approved",
        icon: CheckCircle,
        className: "approved"
      };
    }

    if (status === "rejected") {
      return {
        label: "Rejected",
        icon: XCircle,
        className: "rejected"
      };
    }

    return {
      label: "Pending review",
      icon: AlertCircle,
      className: "pending"
    };
  };

  // Format event date
  const formatDate = (date) => {
    if (!date) return "Date not set";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="organizer-layout">

      {/* Sidebar */}
      <aside className={`organizer-sidebar ${menuOpen ? "open" : ""}`}>

        <div className="organizer-brand">
          <div className="organizer-brand-icon">E</div>

          <div>
            <h2>EventEase</h2>
            <span>ORGANIZER STUDIO</span>
          </div>

          <button
            className="organizer-close"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="organizer-side-label">
          WORKSPACE
        </div>

        <button
          className="organizer-nav-item active"
          onClick={() => {
            navigate("/organizer");
            setMenuOpen(false);
          }}
        >
          <LayoutDashboard size={19} />
          Overview
        </button>

        <button
          className="organizer-nav-item"
          onClick={() => {
            navigate("/organizer/events");
            setMenuOpen(false);
          }}
        >
          <CalendarDays size={19} />
          My Events
        </button>

        <button
          className="organizer-nav-item"
          onClick={() => {
            navigate("/organizer/attendees");
            setMenuOpen(false);
          }}
        >
          <Users size={19} />
          Attendee Management
        </button>

        <button
          className="organizer-nav-item"
          onClick={() => {
            navigate("/organizer/analytics");
            setMenuOpen(false);
          }}
        >
          <TrendingUp size={19} />
          Analytics
        </button>

        <button
          className="organizer-nav-item"
          onClick={() => {
            navigate("/organizer/events/new");
            setMenuOpen(false);
          }}
        >
          <Plus size={19} />
          Create Event
        </button>

        <div className="organizer-side-bottom">

          <div className="organizer-profile">
            <div className="organizer-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "O"}
            </div>

            <div className="organizer-profile-info">
              <strong>{user?.name || "Organizer"}</strong>
              <span>Verified Organizer</span>
            </div>
          </div>

          <button
            className="organizer-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>

        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="organizer-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="organizer-main">

        <header className="organizer-topbar">

          <button
            className="organizer-menu-button"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div>
            <span className="organizer-top-label">
              EVENT MANAGEMENT
            </span>
            <h2>Organizer Dashboard</h2>
          </div>

          <div className="organizer-top-actions">

            <button
              className="organizer-refresh"
              onClick={fetchEvents}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="organizer-create-button"
              onClick={() => navigate("/organizer/events/new")}
            >
              <Plus size={18} />
              Create Event
            </button>

          </div>
        </header>

        <section className="organizer-content">

          {/* Welcome */}
          <div className="organizer-welcome">

            <div>
              <span className="organizer-eyebrow">
                YOUR EVENT SPACE
              </span>

              <h1>
                Welcome back, {user?.name?.split(" ")[0] || "Organizer"}.
              </h1>

              <p>
                Manage your events, monitor approvals and grow your audience.
              </p>
            </div>

            <div className="organizer-welcome-mark">
              E.
            </div>

          </div>

          {/* Statistics */}
          <div className="organizer-section-heading">
            <div>
              <h2>Performance overview</h2>
              <p>A snapshot of your event activity</p>
            </div>
          </div>

          <div className="organizer-stats-grid">

            <div className="organizer-stat-card">
              <div className="organizer-stat-top">
                <span>Total Events</span>
                <CalendarDays size={20} />
              </div>
              <strong>{events.length}</strong>
              <small>Events created by you</small>
            </div>

            <div className="organizer-stat-card">
              <div className="organizer-stat-top">
                <span>Approved</span>
                <CheckCircle size={20} />
              </div>
              <strong>{approved}</strong>
              <small>Published events</small>
            </div>

            <div className="organizer-stat-card">
              <div className="organizer-stat-top">
                <span>Pending</span>
                <Clock size={20} />
              </div>
              <strong>{pending}</strong>
              <small>Awaiting admin review</small>
            </div>

            <div className="organizer-stat-card">
              <div className="organizer-stat-top">
                <span>Total Capacity</span>
                <Users size={20} />
              </div>
              <strong>{totalCapacity}</strong>
              <small>Total event capacity</small>
            </div>

          </div>

          {/* Recent events */}
          <div className="organizer-section-heading organizer-events-heading">

            <div>
              <h2>Your events</h2>
              <p>Manage and monitor your event submissions</p>
            </div>

            <button
              className="organizer-view-all"
              onClick={() => navigate("/organizer/events")}
            >
              View all
            </button>

          </div>

          {/* Error message */}
          {error && (
            <div className="organizer-error">
              <AlertCircle size={18} />
              {error}
              <button onClick={fetchEvents}>
                Try again
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (

            <div className="organizer-loading">
              <RefreshCw
                className="organizer-spinner"
                size={24}
              />
              <p>Loading your events...</p>
            </div>

          ) : events.length === 0 ? (

            /* Empty state */
            <div className="organizer-empty">

              <div className="organizer-empty-icon">
                <CalendarDays size={32} />
              </div>

              <h3>Your event journey starts here.</h3>

              <p>
                Create your first event and submit it for admin approval.
              </p>

              <button
                className="organizer-create-button"
                onClick={() => navigate("/organizer/events/new")}
              >
                <Plus size={18} />
                Create your first event
              </button>

            </div>

          ) : (

            /* Events list */
            <div className="organizer-events-list">

              {events.slice(0, 5).map((event) => {

                const status = getStatus(event.approvalStatus);
                const StatusIcon = status.icon;

                return (
                  <article
                    className="organizer-event-row"
                    key={event._id}
                  >

                    <div className="organizer-event-icon">
                      <CalendarDays size={24} />
                    </div>

                    <div className="organizer-event-info">

                      <span className="organizer-event-category">
                        {event.category}
                      </span>

                      <h3>{event.title}</h3>

                      <div className="organizer-event-meta">

                        <span>
                          <Clock size={14} />
                          {formatDate(event.startDate)}
                        </span>

                        <span>
                          <MapPin size={14} />
                          {event.location || event.venue}
                        </span>

                        <span>
                          <Ticket size={14} />
                          ₹{event.ticketPrice}
                        </span>

                      </div>
                    </div>

                    <div className={`organizer-status ${status.className}`}>
                      <StatusIcon size={15} />
                      {status.label}
                    </div>

                    <div className="organizer-event-actions">

                      <button
                        title="Edit event"
                        onClick={() =>
                          navigate(`/organizer/events/${event._id}/edit`)
                        }
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        title="Delete event"
                        onClick={() => handleDelete(event._id)}
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

          <div className="organizer-footer">
            <span>EVENTEASE ORGANIZER STUDIO</span>
            <span>Made for memorable experiences.</span>
          </div>

        </section>
      </main>
    </div>
  );
}
