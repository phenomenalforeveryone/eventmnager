
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Plus,
  Users,
  BarChart3,
  Ticket,
  TrendingUp,
  IndianRupee,
  UserCheck,
  ArrowUpRight,
  Menu,
  X,
  LogOut,
  Download,
  Activity,
  MapPin,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./OrganizerAnalytics.css";

const categoryColors = [
  "#087f5b",
  "#c49a50",
  "#e58b71",
  "#64748b",
  "#7c6aa6",
  "#3d8c9b",
  "#b66b46",
  "#87966b"
];

function OrganizerAnalytics() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventResponse, bookingResponse] = await Promise.all([
        api.get("/events/my-events"),
        api.get("/bookings/organizer")
      ]);

      setEvents(eventResponse.data.events || []);
      setBookings(bookingResponse.data.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus === "confirmed"),
    [bookings]
  );

  const totalTickets = confirmedBookings.reduce(
    (sum, booking) => sum + Number(booking.quantity || 0),
    0
  );

  const totalBookingValue = confirmedBookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0
  );

  const monthlyData = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1
      );

      const monthBookings = confirmedBookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);

        return (
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getFullYear() === date.getFullYear()
        );
      });

      return {
        month: date.toLocaleDateString("en-IN", { month: "short" }),
        bookings: monthBookings.length
      };
    });
  }, [confirmedBookings]);

  const maxBookings = Math.max(
    1,
    ...monthlyData.map((item) => item.bookings)
  );

  const categoryData = useMemo(() => {
    const counts = {};

    events.forEach((event) => {
      const category = event.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
    });

    const total = events.length || 1;

    return Object.entries(counts)
      .map(([name, count], index) => ({
        name,
        percentage: Math.round((count / total) * 100),
        color: categoryColors[index % categoryColors.length]
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [events]);

  const topEvents = useMemo(() => {
    return events
      .map((event) => {
        const eventBookings = confirmedBookings.filter(
          (booking) => booking.event?._id === event._id
        );

        const tickets = eventBookings.reduce(
          (sum, booking) => sum + Number(booking.quantity || 0),
          0
        );

        const value = eventBookings.reduce(
          (sum, booking) => sum + Number(booking.totalAmount || 0),
          0
        );

        return {
          id: event._id,
          name: event.title,
          category: event.category || "Other",
          bookings: eventBookings.length,
          tickets,
          revenue: value
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [events, confirmedBookings]);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExport = () => {
    const headers = [
      "Event",
      "Category",
      "Confirmed Bookings",
      "Tickets",
      "Booking Value"
    ];

    const rows = topEvents.map((event) => [
      event.name,
      event.category,
      event.bookings,
      event.tickets,
      event.revenue
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "eventease-analytics.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-layout">
      <aside className={`analytics-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="analytics-brand">
          <div className="analytics-brand-icon">E</div>
          <div>
            <h2>EventEase</h2>
            <span>ORGANIZER STUDIO</span>
          </div>
        </div>

        <div className="analytics-sidebar-label">WORKSPACE</div>

        <nav className="analytics-nav">
          <button onClick={() => navigate("/organizer")}>
            <LayoutDashboard size={19} />
            Overview
          </button>

          <button onClick={() => navigate("/organizer/events")}>
            <CalendarDays size={19} />
            My Events
          </button>

          <button onClick={() => navigate("/organizer/events/new")}>
            <Plus size={19} />
            Create Event
          </button>

          <button onClick={() => navigate("/organizer/attendees")}>
            <Users size={19} />
            Attendee Management
          </button>

          <button className="active">
            <BarChart3 size={19} />
            Analytics
          </button>
        </nav>

        <div className="analytics-sidebar-bottom">
          <div className="analytics-sidebar-note">
            <Activity size={18} />
            <p>Your event performance at a glance.</p>
          </div>

          <button className="analytics-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="analytics-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="analytics-main">
        <header className="analytics-topbar">
          <button
            className="analytics-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div>
            <span className="analytics-breadcrumb">Organizer /</span>
            <strong> Analytics</strong>
          </div>

          <div className="analytics-topbar-right">
            <span className="analytics-preview-label">LIVE DATA</span>
            <div className="analytics-avatar">
              {(user?.name || "O").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="analytics-content">
          <div className="analytics-heading">
            <div>
              <span className="analytics-eyebrow">
                PERFORMANCE OVERVIEW
              </span>
              <h1>Analytics & Insights</h1>
              <p>
                Understand your event performance and make better decisions.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="analytics-export-button"
                onClick={fetchAnalytics}
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <button
                className="analytics-export-button"
                onClick={handleExport}
              >
                <Download size={17} />
                Export Report
              </button>
            </div>
          </div>

          {error && (
            <div className="analytics-notice">
              <Activity size={17} />
              <span>{error}</span>
            </div>
          )}

          <div className="analytics-notice">
            <Activity size={17} />
            <span>
              {loading
                ? "Loading live analytics..."
                : "Analytics calculated from your actual event and booking records."}
            </span>
          </div>

          <div className="analytics-stats-grid">
            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <span>Confirmed Bookings</span>
                <div className="analytics-stat-icon emerald">
                  <Ticket size={20} />
                </div>
              </div>
              <h2>{loading ? "—" : confirmedBookings.length}</h2>
              <div className="analytics-stat-change">
                {totalTickets} <span>confirmed tickets</span>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <span>Booking Value</span>
                <div className="analytics-stat-icon gold">
                  <IndianRupee size={20} />
                </div>
              </div>
              <h2>{loading ? "—" : formatCurrency(totalBookingValue)}</h2>
              <div className="analytics-stat-change">
                <span>Value of confirmed bookings</span>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <span>Registered Attendees</span>
                <div className="analytics-stat-icon coral">
                  <Users size={20} />
                </div>
              </div>
              <h2>{loading ? "—" : bookings.length}</h2>
              <div className="analytics-stat-change">
                <span>Total booking records</span>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <span>Total Events</span>
                <div className="analytics-stat-icon blue">
                  <UserCheck size={20} />
                </div>
              </div>
              <h2>{loading ? "—" : events.length}</h2>
              <div className="analytics-stat-change">
                <span>Your created events</span>
              </div>
            </div>
          </div>

          <div className="analytics-charts-grid">
            <section className="analytics-panel bookings-panel">
              <div className="analytics-panel-heading">
                <div>
                  <h3>Booking Trends</h3>
                  <p>Confirmed bookings over the last six months</p>
                </div>
                <span className="analytics-panel-tag">Last 6 months</span>
              </div>

              <div className="analytics-chart">
                <div className="analytics-y-axis">
                  <span>{maxBookings}</span>
                  <span>{Math.round(maxBookings * 0.75)}</span>
                  <span>{Math.round(maxBookings * 0.5)}</span>
                  <span>{Math.round(maxBookings * 0.25)}</span>
                  <span>0</span>
                </div>

                <div className="analytics-chart-bars">
                  {monthlyData.map((item) => (
                    <div className="analytics-bar-column" key={item.month}>
                      <span className="analytics-bar-value">
                        {item.bookings}
                      </span>

                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar"
                          style={{
                            height: `${(item.bookings / maxBookings) * 100}%`
                          }}
                        />
                      </div>

                      <span className="analytics-bar-month">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="analytics-panel category-panel">
              <div className="analytics-panel-heading">
                <div>
                  <h3>Event Categories</h3>
                  <p>Distribution of your created events</p>
                </div>
              </div>

              {categoryData.length === 0 ? (
                <p>No event categories to display yet.</p>
              ) : (
                <div className="analytics-category-list">
                  {categoryData.map((category) => (
                    <div
                      className="analytics-category-item"
                      key={category.name}
                    >
                      <div className="analytics-category-info">
                        <span>
                          <i style={{ background: category.color }} />
                          {category.name}
                        </span>
                        <strong>{category.percentage}%</strong>
                      </div>

                      <div className="analytics-category-track">
                        <div
                          style={{
                            width: `${category.percentage}%`,
                            background: category.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="analytics-category-footer">
                <span>Total events</span>
                <strong>{events.length}</strong>
              </div>
            </section>
          </div>

          <section className="analytics-panel top-events-panel">
            <div className="analytics-panel-heading">
              <div>
                <h3>Top Performing Events</h3>
                <p>Events ranked by confirmed booking activity</p>
              </div>

              <button
                className="analytics-view-all"
                onClick={() => navigate("/organizer/events")}
              >
                View all events <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>EVENT</th>
                    <th>CATEGORY</th>
                    <th>BOOKINGS</th>
                    <th>TICKETS</th>
                    <th>BOOKING VALUE</th>
                  </tr>
                </thead>

                <tbody>
                  {topEvents.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        No event records available yet.
                      </td>
                    </tr>
                  ) : (
                    topEvents.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div className="analytics-event-name">
                            <div className="analytics-event-icon">
                              <CalendarDays size={17} />
                            </div>
                            <strong>{event.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="analytics-category-badge">
                            {event.category}
                          </span>
                        </td>

                        <td>{event.bookings}</td>
                        <td>{event.tickets}</td>
                        <td className="analytics-revenue">
                          {formatCurrency(event.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="analytics-bottom-grid">
            <section className="analytics-insight-card">
              <div className="analytics-insight-icon">
                <TrendingUp size={21} />
              </div>
              <div>
                <span>PERFORMANCE INSIGHT</span>
                <h3>
                  {confirmedBookings.length > 0
                    ? "Your events are receiving bookings"
                    : "Your booking activity starts here"}
                </h3>
                <p>
                  {confirmedBookings.length > 0
                    ? `You currently have ${confirmedBookings.length} confirmed bookings across your events.`
                    : "Share your approved events to help attendees discover and book them."}
                </p>
              </div>
            </section>

            <section className="analytics-location-card">
              <div className="analytics-location-icon">
                <MapPin size={21} />
              </div>
              <div>
                <span>ORGANIZER TIP</span>
                <h3>Improve event visibility</h3>
                <p>
                  Add clear event descriptions, attractive posters and
                  accurate venue information to help attendees discover
                  your events.
                </p>
              </div>
            </section>
          </div>

          <footer className="analytics-footer">
            <span>© 2026 EventEase</span>
            <span>Organizer Analytics · Live Data</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default OrganizerAnalytics;
