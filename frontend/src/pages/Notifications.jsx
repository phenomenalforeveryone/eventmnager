
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Compass,
  Ticket,
  Heart,
  UserRound,
  LogOut,
  Bell,
  Check,
  CheckCheck,
  CalendarDays,
  CreditCard,
  UserCheck,
  Info,
  Menu,
  X,
  RefreshCw,
  ArrowUpRight,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Notifications.css";

const formatTime = (date) => {
  if (!date) return "";

  const value = new Date(date);
  const now = new Date();
  const difference = Math.floor((now - value) / 60000);

  if (difference < 1) return "Just now";
  if (difference < 60) return `${difference} min ago`;

  const hours = Math.floor(difference / 60);
  if (hours < 24) return `${hours} hr ago`;

  if (hours < 48) return "Yesterday";

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getIcon = (type) => {
  switch (type) {
    case "booking":
      return <Ticket size={20} />;
    case "event":
      return <CalendarDays size={20} />;
    case "organizer":
      return <UserCheck size={20} />;
    default:
      return <Info size={20} />;
  }
};

function Notifications() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const firstName = user?.name?.split(" ")[0] || "there";

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "Unread") {
      return notifications.filter((item) => !item.isRead);
    }

    if (activeFilter === "Read") {
      return notifications.filter((item) => item.isRead);
    }

    return notifications;
  }, [notifications, activeFilter]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update this notification."
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    setActionLoading(true);
    setError("");

    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to mark notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.isRead) {
      await handleMarkRead(item._id);
    }

    if (item.link) {
      navigate(item.link);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="notifications-layout">
      <aside className={`notifications-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="notifications-brand">
          <div className="notifications-brand-icon">E</div>
          <div>
            <h2>EventEase</h2>
            <span>YOUR EVENT WORLD</span>
          </div>
        </div>

        <div className="notifications-sidebar-label">MENU</div>

        <nav className="notifications-navigation">
          <button onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button onClick={() => navigate("/events")}>
            <Compass size={19} />
            Explore Events
          </button>

          <button onClick={() => navigate("/user/bookings")}>
            <Ticket size={19} />
            My Bookings
          </button>

          <button onClick={() => navigate("/user/tickets")}>
            <CreditCard size={19} />
            My Tickets
          </button>

          <button onClick={() => navigate("/user/saved")}>
            <Heart size={19} />
            Saved Events
          </button>

          <button onClick={() => navigate("/user/profile")}>
            <UserRound size={19} />
            My Profile
          </button>

          <button className="active">
            <Bell size={19} />
            Notifications
            {unreadCount > 0 && (
              <span className="notifications-nav-count">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        <div className="notifications-sidebar-bottom">
          <div className="notifications-promo">
            <Bell size={20} />
            <h4>Stay in the loop</h4>
            <p>Important updates about your events and bookings.</p>
          </div>

          <button className="notifications-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="notifications-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="notifications-main">
        <header className="notifications-topbar">
          <div className="notifications-topbar-left">
            <button
              className="notifications-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span>My Space</span>
            <span>/</span>
            <strong>Notifications</strong>
          </div>

          <div className="notifications-topbar-right">
            <span>EVENT ENTHUSIAST</span>
            <div className="notifications-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="notifications-content">
          <section className="notifications-heading">
            <div>
              <span className="notifications-eyebrow">YOUR UPDATES</span>
              <h1>Notifications</h1>
              <p>Stay updated with your bookings and event activities.</p>
            </div>

            <button
              className="notifications-refresh"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </section>

          <section className="notifications-summary">
            <div className="notifications-summary-card">
              <div className="notifications-summary-icon">
                <Bell size={21} />
              </div>
              <div>
                <span>Total Notifications</span>
                <h2>{notifications.length}</h2>
              </div>
            </div>

            <div className="notifications-summary-card">
              <div className="notifications-summary-icon unread">
                <CheckCheck size={21} />
              </div>
              <div>
                <span>Unread</span>
                <h2>{unreadCount}</h2>
              </div>
            </div>
          </section>

          {error && (
            <div className="notifications-error">
              {error}
              <button onClick={fetchNotifications}>Retry</button>
            </div>
          )}

          <section className="notifications-list-section">
            <div className="notifications-list-heading">
              <div>
                <h2>Recent Activity</h2>
                <p>Your latest updates and alerts.</p>
              </div>

              <button
                className="notifications-mark-all"
                onClick={handleMarkAllRead}
                disabled={actionLoading || unreadCount === 0}
              >
                <CheckCheck size={16} />
                {actionLoading ? "Updating..." : "Mark all as read"}
              </button>
            </div>

            <div className="notifications-filters">
              {["All", "Unread", "Read"].map((filter) => (
                <button
                  key={filter}
                  className={activeFilter === filter ? "active" : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="notifications-list">
              {loading ? (
                <div className="notifications-empty">
                  <RefreshCw size={28} />
                  <h3>Loading notifications...</h3>
                  <p>Please wait while we retrieve your updates.</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((item) => (
                  <article
                    key={item._id}
                    className={`notifications-item ${
                      item.isRead ? "read" : "unread"
                    }`}
                  >
                    <div className={`notifications-item-icon ${item.type}`}>
                      {getIcon(item.type)}
                    </div>

                    <button
                      className="notifications-item-content"
                      onClick={() => handleNotificationClick(item)}
                    >
                      <div className="notifications-item-title">
                        <h3>{item.title}</h3>
                        {!item.isRead && (
                          <span className="notifications-unread-dot" />
                        )}
                      </div>

                      <p>{item.message}</p>

                      <span className="notifications-time">
                        {formatTime(item.createdAt)}
                      </span>
                    </button>

                    <div className="notifications-item-actions">
                      {!item.isRead && (
                        <button
                          title="Mark as read"
                          onClick={() => handleMarkRead(item._id)}
                        >
                          <Check size={17} />
                        </button>
                      )}

                      {item.link && (
                        <button
                          title="Open notification"
                          onClick={() => handleNotificationClick(item)}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="notifications-empty">
                  <div>
                    <Bell size={30} />
                  </div>
                  <h3>
                    {notifications.length === 0
                      ? "No notifications yet"
                      : "No notifications found"}
                  </h3>
                  <p>
                    {notifications.length === 0
                      ? "Updates about your bookings and events will appear here."
                      : "Try selecting another filter."}
                  </p>

                  {notifications.length > 0 && (
                    <button onClick={() => setActiveFilter("All")}>
                      Show all notifications
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <footer className="notifications-footer">
            <span>© 2026 EventEase. Made for experiences.</span>
            <span>Your next story starts here.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Notifications;
