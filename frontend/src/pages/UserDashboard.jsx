
import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Compass,
  Ticket,
  CalendarDays,
  Heart,
  UserRound,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  MapPin,
  Clock,
  Search,
  ChevronRight,
  Sparkles,
  Bookmark,
  QrCode,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./UserDashboard.css";

const SAVED_KEY = "eventease_saved_events";

const formatDate = (date) => {
  if (!date) return "Date to be announced";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getPosterUrl = (poster) => {
  if (!poster) {
    return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";
  }

  if (poster.startsWith("http")) return poster;

  return `http://localhost:5000${poster.startsWith("/") ? "" : "/"}${poster}`;
};

function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.name?.split(" ")[0] || "there";

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [bookingResponse, eventResponse] = await Promise.all([
        api.get("/bookings/my-bookings"),
        api.get("/events")
      ]);

      setBookings(bookingResponse.data.bookings || []);
      setEvents(eventResponse.data.events || []);

      try {
        const saved = JSON.parse(
          localStorage.getItem(SAVED_KEY) || "[]"
        );
        setSavedCount(Array.isArray(saved) ? saved.length : 0);
      } catch {
        setSavedCount(0);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const upcomingBookings = useMemo(() => {
    const now = new Date();

    return bookings
      .filter((booking) => {
        const eventDate = booking.event?.startDate;
        return (
          booking.bookingStatus === "confirmed" &&
          eventDate &&
          new Date(eventDate) >= now
        );
      })
      .sort(
        (a, b) =>
          new Date(a.event.startDate) - new Date(b.event.startDate)
      )
      .slice(0, 3);
  }, [bookings]);

  const upcomingCount = bookings.filter((booking) => {
    return (
      booking.bookingStatus === "confirmed" &&
      booking.event?.startDate &&
      new Date(booking.event.startDate) >= new Date()
    );
  }).length;

  const recommendations = events
    .filter((event) => new Date(event.startDate) >= new Date())
    .slice(0, 3);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="user-dashboard-layout">
      <aside className={`user-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="user-brand">
          <div className="user-brand-icon">E</div>
          <div>
            <h2>EventEase</h2>
            <span>YOUR EVENT WORLD</span>
          </div>
        </div>

        <div className="user-sidebar-label">MENU</div>

        <nav className="user-navigation">
          <button className="active">
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
            <QrCode size={19} />
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
        </nav>

        <div className="user-sidebar-bottom">
          <div className="user-sidebar-promo">
            <Sparkles size={19} />
            <h4>Make memories.</h4>
            <p>Discover experiences worth remembering.</p>
            <button onClick={() => navigate("/events")}>
              Explore now <ArrowUpRight size={14} />
            </button>
          </div>

          <button className="user-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="user-sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="user-dashboard-main">
        <header className="user-topbar">
          <div className="user-topbar-left">
            <button
              className="user-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span>My Space</span>
            <ChevronRight size={15} />
            <strong>Dashboard</strong>
          </div>

          <div className="user-topbar-right">
            <span className="user-member-label">EVENT ENTHUSIAST</span>
            <div className="user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="user-dashboard-content">
          <section className="user-welcome-section">
            <div>
              <span className="user-eyebrow">YOUR EVENT JOURNEY</span>
              <h1>
                Welcome back, <span>{firstName}.</span>
              </h1>
              <p>
                Your next memorable experience could be just around the
                corner.
              </p>
            </div>

            <button
              className="user-explore-button"
              onClick={() => navigate("/events")}
            >
              <Search size={17} />
              Explore Events
            </button>
          </section>

          <section className="user-hero-banner">
            <div className="user-hero-copy">
              <span>DISCOVER. CONNECT. EXPERIENCE.</span>
              <h2>Life is better when you're part of something.</h2>
              <p>
                Find experiences, meet people, and make every moment count.
              </p>
              <button onClick={() => navigate("/events")}>
                Find your next event <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="user-hero-decoration">
              <CalendarDays size={110} strokeWidth={0.8} />
            </div>
          </section>

          {error && (
            <div className="user-dashboard-error">
              <p>{error}</p>
              <button onClick={fetchDashboardData}>
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          )}

          <section className="user-overview-stats">
            <div className="user-overview-card">
              <div className="user-overview-icon green">
                <Ticket size={20} />
              </div>
              <div>
                <span>Total Bookings</span>
                <h2>{loading ? "—" : bookings.length}</h2>
                <small>Across all events</small>
              </div>
            </div>

            <div className="user-overview-card">
              <div className="user-overview-icon gold">
                <CalendarDays size={20} />
              </div>
              <div>
                <span>Upcoming Events</span>
                <h2>{loading ? "—" : upcomingCount}</h2>
                <small>Confirmed bookings</small>
              </div>
            </div>

            <div className="user-overview-card">
              <div className="user-overview-icon coral">
                <Heart size={20} />
              </div>
              <div>
                <span>Saved Events</span>
                <h2>{loading ? "—" : savedCount}</h2>
                <small>On your wishlist</small>
              </div>
            </div>
          </section>

          <section className="user-bookings-section">
            <div className="user-section-heading">
              <div>
                <span className="user-section-eyebrow">YOUR CALENDAR</span>
                <h2>Upcoming Bookings</h2>
                <p>Keep track of the experiences you've booked.</p>
              </div>

              <button
                className="user-text-link"
                onClick={() => navigate("/user/bookings")}
              >
                View all <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="user-bookings-list">
              {loading ? (
                <p>Loading your bookings...</p>
              ) : upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking, index) => {
                  const event = booking.event || {};

                  return (
                    <article
                      className="user-booking-card"
                      key={booking._id}
                    >
                      <div
                        className={`user-booking-date ${
                          index % 2 === 0 ? "emerald" : "gold"
                        }`}
                      >
                        <CalendarDays size={22} />
                      </div>

                      <div className="user-booking-info">
                        <div className="user-booking-title-row">
                          <h3>{event.title || "Event"}</h3>
                          <span className="user-booking-status confirmed">
                            Confirmed
                          </span>
                        </div>

                        <span className="user-booking-category">
                          {event.category || "Event"}
                        </span>

                        <div className="user-booking-details">
                          <span>
                            <CalendarDays size={14} />
                            {formatDate(event.startDate)}
                          </span>

                          <span>
                            <Clock size={14} />
                            {formatTime(event.startDate)}
                          </span>

                          <span>
                            <MapPin size={14} />
                            {event.venue || event.location || "Location pending"}
                          </span>
                        </div>
                      </div>

                      <div className="user-booking-action">
                        <span>
                          {booking.quantity || 1} Ticket(s)
                        </span>
                        <button onClick={() => navigate("/user/tickets")}>
                          View Ticket <ChevronRight size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="user-empty-bookings">
                  <Ticket size={28} />
                  <h3>No upcoming bookings yet</h3>
                  <p>Explore events and book your next experience.</p>
                  <button onClick={() => navigate("/events")}>
                    Explore events <ArrowUpRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="user-recommendations-section">
            <div className="user-section-heading">
              <div>
                <span className="user-section-eyebrow">DISCOVER</span>
                <h2>Explore Upcoming Events</h2>
                <p>Find something exciting to look forward to.</p>
              </div>

              <button
                className="user-text-link"
                onClick={() => navigate("/events")}
              >
                Explore all <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="user-recommendation-grid">
              {loading ? (
                <p>Loading events...</p>
              ) : recommendations.length > 0 ? (
                recommendations.map((event) => (
                  <article
                    className="user-recommendation-card"
                    key={event._id}
                  >
                    <div className="user-recommendation-image">
                      <img
                        src={getPosterUrl(event.poster)}
                        alt={event.title}
                      />
                      <span>{event.category}</span>
                      <button
                        className="user-save-event"
                        aria-label={`Save ${event.title}`}
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        <Bookmark size={17} />
                      </button>
                    </div>

                    <div className="user-recommendation-info">
                      <h3>{event.title}</h3>

                      <span>
                        <CalendarDays size={14} />
                        {formatDate(event.startDate)}
                      </span>

                      <span>
                        <MapPin size={14} />
                        {event.location || event.venue}
                      </span>

                      <div className="user-recommendation-bottom">
                        <strong>
                          {Number(event.ticketPrice) === 0
                            ? "Free"
                            : `₹${event.ticketPrice}`}
                        </strong>
                        <button
                          onClick={() => navigate(`/events/${event._id}`)}
                        >
                          View event <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p>No upcoming events are available right now.</p>
              )}
            </div>
          </section>

          <footer className="user-dashboard-footer">
            <span>© 2026 EventEase. Made for experiences.</span>
            <span>Your next story starts here.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
