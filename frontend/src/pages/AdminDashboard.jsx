
import { useEffect, useState } from "react";
import {
  LayoutDashboard, CalendarDays, Users, Ticket,
  CheckCircle, XCircle, LogOut, RefreshCw,
  ShieldCheck, Menu, X, TrendingUp, Mail,
  Phone, Globe, Building2, User, Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setMessage("");

    const results = await Promise.allSettled([
      api.get("/admin/users"),
      api.get("/admin/organizer-applications"),
      api.get("/admin/events/pending")
    ]);

    if (results[0].status === "fulfilled") {
      setUsers(results[0].value.data.users || []);
    }

    if (results[1].status === "fulfilled") {
      const data = results[1].value.data;
      setOrganizers(data.applications || data.organizers || []);
    }

    if (results[2].status === "fulfilled") {
      setEvents(results[2].value.data.events || []);
    }

    if (results.every(result => result.status === "rejected")) {
      setMessage("Could not load dashboard data. Check your backend.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const reviewEvent = async (id, action) => {
    setBusyId(id);

    try {
      await api.patch(`/admin/events/${id}/review`, { action });
      setEvents(current => current.filter(event => event._id !== id));
      setMessage(`Event ${action}d successfully.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Event review failed.");
    } finally {
      setBusyId("");
    }
  };

  const reviewOrganizer = async (id, action) => {
    let reason = "";

    if (action === "reject") {
      reason = window.prompt("Enter a reason for rejecting this application:") || "";
    }

    setBusyId(id);

    try {
      await api.patch(`/admin/organizers/${id}/review`, {
        action,
        reason
      });

      setOrganizers(current => current.filter(item => item._id !== id));
      setMessage(`Organizer application ${action}d successfully.`);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Organizer review failed."
      );
    } finally {
      setBusyId("");
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "events", label: "Event approvals", icon: CalendarDays },
    { id: "organizers", label: "Organizers", icon: ShieldCheck },
    { id: "users", label: "Users", icon: Users }
  ];

  const stats = [
    { label: "Total users", value: users.length, icon: Users },
    { label: "Pending events", value: events.length, icon: CalendarDays },
    { label: "Organizer applications", value: organizers.length, icon: ShieldCheck },
    { label: "Total bookings", value: "—", icon: Ticket }
  ];

  const formatDate = date =>
    date ? new Date(date).toLocaleDateString("en-IN") : "—";

  const logoutAdmin = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="admin-brand">
          <CalendarDays size={27} />
          <span>Event<span>Ease</span></span>
        </div>

        <div className="admin-side-label">MANAGEMENT</div>

        <nav className="admin-nav">
          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={activeTab === item.id ? "active" : ""}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenu(false);
                  setMessage("");
                }}
              >
                <Icon size={19} />
                {item.label}
                {item.id === "events" && events.length > 0 && (
                  <span className="nav-count">{events.length}</span>
                )}
                {item.id === "organizers" && organizers.length > 0 && (
                  <span className="nav-count">{organizers.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user?.name || "Administrator"}</strong>
              <small>Platform Admin</small>
            </div>
          </div>

          <button className="admin-logout" onClick={logoutAdmin}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="admin-overlay"
          onClick={() => setMobileMenu(false)}
          aria-label="Close menu"
        />
      )}

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>

          <div>
            <span className="admin-top-eyebrow">EVENTEASE CONTROL CENTRE</span>
            <h2>Administration</h2>
          </div>

          <button
            className="admin-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "spinning" : ""} />
            Refresh
          </button>
        </header>

        <section className="admin-content">
          <div className="admin-welcome">
            <div>
              <span className="admin-eyebrow">YOUR PLATFORM AT A GLANCE</span>
              <h1>
                Welcome back,{" "}
                <span>{user?.name?.split(" ")[0] || "Admin"}.</span>
              </h1>
              <p>Manage events, organizers and your EventEase community.</p>
            </div>
            <div className="welcome-icon">
              <ShieldCheck size={54} />
            </div>
          </div>

          {message && (
            <div className="admin-message">
              {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          <div className="admin-stats">
            {stats.map(stat => {
              const Icon = stat.icon;

              return (
                <div className="admin-stat-card" key={stat.label}>
                  <div className="stat-icon"><Icon size={21} /></div>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              );
            })}
          </div>

          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">WORKSPACE</span>
              <h2>
                {activeTab === "overview" && "Platform overview"}
                {activeTab === "events" && "Pending event approvals"}
                {activeTab === "organizers" && "Organizer applications"}
                {activeTab === "users" && "Registered users"}
              </h2>
            </div>
            <span className="admin-live"><span /> Live data</span>
          </div>

          {loading ? (
            <div className="admin-empty">
              <RefreshCw className="spinning" size={25} />
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="admin-overview-grid">
                  <div className="admin-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Pending events</h3>
                        <p>Events waiting for your approval</p>
                      </div>
                      <button onClick={() => setActiveTab("events")}>View all</button>
                    </div>

                    {events.length === 0 ? (
                      <div className="admin-small-empty">
                        <CheckCircle size={25} />
                        <p>All caught up! No pending events.</p>
                      </div>
                    ) : events.slice(0, 4).map(event => (
                      <div className="admin-list-row" key={event._id}>
                        <div className="list-icon"><CalendarDays /></div>
                        <div className="list-info">
                          <strong>{event.title}</strong>
                          <small>{event.category} · {event.location}</small>
                        </div>
                        <span className="status-pending">Pending</span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Organizer applications</h3>
                        <p>People requesting organizer access</p>
                      </div>
                      <button onClick={() => setActiveTab("organizers")}>View all</button>
                    </div>

                    {organizers.length === 0 ? (
                      <div className="admin-small-empty">
                        <CheckCircle size={25} />
                        <p>No pending applications.</p>
                      </div>
                    ) : organizers.slice(0, 4).map(item => (
                      <div className="admin-list-row" key={item._id}>
                        <div className="list-icon"><Users /></div>
                        <div className="list-info">
                          <strong>{item.name}</strong>
                          <small>{item.email}</small>
                        </div>
                        <span className="status-pending">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "events" && (
                <div className="admin-panel">
                  {events.length === 0 ? (
                    <div className="admin-empty">
                      <CheckCircle size={35} />
                      <h3>No pending events</h3>
                      <p>New event submissions will appear here.</p>
                    </div>
                  ) : events.map(event => (
                    <div className="approval-card" key={event._id}>
                      <div className="approval-details">
                        <span className="approval-category">{event.category}</span>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <div className="approval-meta">
                          <span>{event.location}</span>
                          <span>{formatDate(event.startDate)}</span>
                          <span>₹{event.ticketPrice}</span>
                        </div>
                        <small>Organizer: {event.organizer?.name || "Unknown"}</small>
                      </div>

                      <div className="approval-actions">
                        <button
                          className="approve-btn"
                          disabled={busyId === event._id}
                          onClick={() => reviewEvent(event._id, "approve")}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          className="reject-btn"
                          disabled={busyId === event._id}
                          onClick={() => reviewEvent(event._id, "reject")}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "organizers" && (
                <div className="admin-panel">
                  {organizers.length === 0 ? (
                    <div className="admin-empty">
                      <CheckCircle size={35} />
                      <h3>No pending applications</h3>
                      <p>New organizer applications will appear here.</p>
                    </div>
                  ) : organizers.map(item => (
                    <div className="approval-card" key={item._id}>
                      <div className="approval-details">
                        <span className="approval-category">ORGANIZER APPLICATION</span>
                        <h3>{item.name}</h3>

                        <div className="organizer-application-details">
                          <p><Mail size={15} /> {item.email}</p>
                          <p>
                            <User size={15} />
                            {item.organizerType || "Individual"}
                          </p>

                          {item.organizationName && (
                            <p><Building2 size={15} /> {item.organizationName}</p>
                          )}

                          {item.contactNumber && (
                            <p><Phone size={15} /> {item.contactNumber}</p>
                          )}

                          {item.organizerExperience && (
                            <p><Clock size={15} /> {item.organizerExperience}</p>
                          )}

                          {item.organizerWebsite && (
                            <p>
                              <Globe size={15} />
                              <a
                                href={item.organizerWebsite}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Visit website / social profile
                              </a>
                            </p>
                          )}

                          <p>
                            <CalendarDays size={15} />
                            Applied: {formatDate(item.updatedAt || item.createdAt)}
                          </p>
                        </div>

                        <small>Application status: Pending review</small>
                      </div>

                      <div className="approval-actions">
                        <button
                          className="approve-btn"
                          disabled={busyId === item._id}
                          onClick={() => reviewOrganizer(item._id, "approve")}
                        >
                          <CheckCircle size={16} />
                          {busyId === item._id ? "Please wait..." : "Approve"}
                        </button>

                        <button
                          className="reject-btn"
                          disabled={busyId === item._id}
                          onClick={() => reviewOrganizer(item._id, "reject")}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "users" && (
                <div className="admin-panel table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(person => (
                        <tr key={person._id}>
                          <td>{person.name}</td>
                          <td>{person.email}</td>
                          <td>
                            <span className="role-pill">{person.role}</span>
                          </td>
                          <td>{formatDate(person.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="admin-empty">No users found.</div>
                  )}
                </div>
              )}
            </>
          )}

          <footer className="admin-footer">
            <span>EventEase © 2026</span>
            <span>Discover. Experience. Remember.</span>
            <span><TrendingUp size={14} /> Admin workspace</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
