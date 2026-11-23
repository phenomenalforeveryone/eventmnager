
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  CalendarDays,
  MapPin,
  ArrowRight,
  Trash2,
  Ticket,
  Compass,
  LayoutDashboard,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./SavedEvents.css";

const STORAGE_KEY = "eventease_saved_events";

const categories = [
  "All",
  "Technology",
  "Music",
  "Sports",
  "Cultural",
  "Workshop",
  "Education",
  "Business",
  "Other"
];

const getSavedIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.map(String) : [];
  } catch {
    return [];
  }
};

const formatDate = (date) => {
  if (!date) return "Date to be announced";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const getPosterUrl = (poster) => {
  if (!poster) {
    return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900";
  }

  if (poster.startsWith("http")) return poster;

  return `http://localhost:5000${poster.startsWith("/") ? "" : "/"}${poster}`;
};

export default function SavedEvents() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [events, setEvents] = useState([]);
  const [savedIds, setSavedIds] = useState(getSavedIds);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSavedEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const ids = getSavedIds();
      setSavedIds(ids);

      if (ids.length === 0) {
        setEvents([]);
        return;
      }

      const response = await api.get("/events");
      const allEvents = response.data.events || [];

      const savedEvents = allEvents.filter((event) =>
        ids.includes(String(event._id))
      );

      setEvents(savedEvents);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your saved events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const removeEvent = (id) => {
    const updatedIds = savedIds.filter(
      (savedId) => savedId !== String(id)
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIds));

    setSavedIds(updatedIds);
    setEvents((previous) =>
      previous.filter((event) => String(event._id) !== String(id))
    );
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.location?.toLowerCase().includes(search.toLowerCase()) ||
        event.category?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || event.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [events, search, category]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="saved-page">
      <aside className="saved-sidebar">
        <div
          className="saved-brand"
          onClick={() => navigate("/events")}
        >
          <div className="saved-brand-icon">E</div>
          <div>
            <h2>EventEase</h2>
            <span>YOUR EXPERIENCE HUB</span>
          </div>
        </div>

        <span className="saved-nav-label">MENU</span>

        <button onClick={() => navigate("/dashboard")}>
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button onClick={() => navigate("/events")}>
          <Compass size={18} /> Explore Events
        </button>

        <button className="active">
          <Heart size={18} /> Saved Events
        </button>

        <button onClick={() => navigate("/user/bookings")}>
          <Ticket size={18} /> My Bookings
        </button>

        <button onClick={() => navigate("/user/tickets")}>
          <CalendarDays size={18} /> My Tickets
        </button>

        <button onClick={() => navigate("/user/profile")}>
          <Heart size={18} /> My Profile
        </button>

        <div className="saved-sidebar-bottom">
          <div className="saved-sidebar-user">
            <div className="saved-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <strong>{user?.name || "EventEase User"}</strong>
              <span>{user?.role || "Attendee"} Account</span>
            </div>
          </div>

          <button onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="saved-main">
        <header className="saved-topbar">
          <div>
            <span className="saved-eyebrow">YOUR COLLECTION</span>
            <h1>Saved Events<span>.</span></h1>
            <p>Keep track of the experiences you don't want to miss.</p>
          </div>

          <div className="saved-summary-note">
            <Heart size={18} />
            <span>{events.length} saved events</span>
          </div>
        </header>

        <section className="saved-search-section">
          <div className="saved-search-box">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search your saved events..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>

        <section className="saved-category-section">
          <div className="saved-category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "selected" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="saved-events-section">
          <div className="saved-section-heading">
            <div>
              <h2>Your wishlist</h2>
              <p>{filteredEvents.length} events found</p>
            </div>
            <span className="saved-preview-label">LIVE EVENT DATA</span>
          </div>

          {loading ? (
            <div className="saved-empty">
              <RefreshCw size={28} />
              <h3>Loading saved events...</h3>
            </div>
          ) : error ? (
            <div className="saved-empty">
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button onClick={fetchSavedEvents}>
                Try again <RefreshCw size={16} />
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="saved-events-grid">
              {filteredEvents.map((event) => (
                <article className="saved-event-card" key={event._id}>
                  <div className="saved-event-image">
                    <img
                      src={getPosterUrl(event.poster)}
                      alt={event.title}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900";
                      }}
                    />

                    <span className="saved-event-category">
                      {event.category}
                    </span>

                    <button
                      className="saved-remove-btn"
                      onClick={() => removeEvent(event._id)}
                      aria-label={`Remove ${event.title} from saved events`}
                      title="Remove from saved events"
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>
                  </div>

                  <div className="saved-event-content">
                    <h3>{event.title}</h3>

                    <p className="saved-event-description">
                      {event.description}
                    </p>

                    <div className="saved-event-info">
                      <span>
                        <CalendarDays size={15} />
                        {formatDate(event.startDate)}
                      </span>

                      <span>
                        <MapPin size={15} />
                        {event.venue
                          ? `${event.venue}, ${event.location}`
                          : event.location}
                      </span>
                    </div>

                    <div className="saved-event-footer">
                      <div className="saved-event-price">
                        <small>Starting from</small>
                        <strong>
                          {Number(event.ticketPrice) === 0
                            ? "Free"
                            : `₹${event.ticketPrice}`}
                        </strong>
                      </div>

                      <button
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        View event <ArrowRight size={15} />
                      </button>
                    </div>

                    <button
                      className="saved-remove-text"
                      onClick={() => removeEvent(event._id)}
                    >
                      <Trash2 size={14} /> Remove from wishlist
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="saved-empty">
              <div><Heart size={32} /></div>
              <h3>
                {events.length === 0
                  ? "Your wishlist is empty"
                  : "No matching events found"}
              </h3>
              <p>
                {events.length === 0
                  ? "Explore events and save the experiences you would love to attend."
                  : "Try changing your search or category filter."}
              </p>

              <button onClick={() => navigate("/events")}>
                Explore events <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        <footer className="saved-footer">
          <span>EVENTEASE © 2026</span>
          <span>Make every moment an experience.</span>
        </footer>
      </main>
    </div>
  );
}
