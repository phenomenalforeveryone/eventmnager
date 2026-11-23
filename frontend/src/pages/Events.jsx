
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Search,
  MapPin,
  ArrowRight,
  LogOut,
  Ticket,
  Sparkles,
  Music2,
  Clock3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const categories = [
  "All Events",
  "Technology",
  "Music",
  "Sports",
  "Cultural",
  "Workshop",
  "Education",
  "Business"
];

export default function Events() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Events");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/events", {
        params: {
          search: search.trim() || undefined,
          category: category === "All Events" ? undefined : category
        }
      });

      setEvents(response.data.events || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  return (
    <div className="cinema-page">

      {/* NAVIGATION */}
      <header className="cinema-navbar">
        <div
          className="cinema-logo"
          onClick={() => navigate("/events")}
        >
          <CalendarDays size={25} />
          <span>EventEase</span>
        </div>

        <nav>
  <a href="#discover">Discover</a>
  <a href="#featured">Experiences</a>

  <button
    onClick={() =>
      navigate(user?.role === "organizer" ? "/organizer" : "/dashboard")
    }
  >
    Dashboard
  </button>

  {user?.role === "user" && (
    <button onClick={() => navigate("/user/bookings")}>
      My Bookings
    </button>
  )}
</nav>

        <div className="cinema-account">
          <span>{user?.name?.split(" ")[0] || "Guest"}</span>
          <button onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* CINEMATIC HERO */}
      <section className="cinema-hero">
        <div className="cinema-overlay" />

        <div className="cinema-hero-content">
          <div className="cinema-eyebrow">
            <Sparkles size={15} />
            WHERE EXPERIENCES COME ALIVE
          </div>

          <h1>
            Your gateway to
            <span> unforgettable events.</span>
          </h1>

          <p>
            Discover extraordinary concerts, festivals,
            workshops and experiences worth remembering.
          </p>

          <button
            className="cinema-cta"
            onClick={() =>
              document.getElementById("discover")?.scrollIntoView({
                behavior: "smooth"
              })
            }
          >
            Discover experiences
            <ArrowRight size={17} />
          </button>
        </div>

        {/* FLOATING GLASS SEARCH PANEL */}
        <div className="glass-search-panel">
          <div className="glass-panel-heading">
            <div>
              <span>YOUR NEXT EXPERIENCE STARTS HERE</span>
              <h2>Find your event</h2>
            </div>
            <Ticket size={30} />
          </div>

          <div className="cinema-search-fields">
            <label className="cinema-search-input">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchEvents();
                }}
                placeholder="Search concerts, events..."
              />
            </label>

            <label className="cinema-select">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <button onClick={fetchEvents}>
              Find Events <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="cinema-main">

        {/* INTRODUCTION */}
        <section className="cinema-intro" id="featured">
          <div>
            <span className="cinema-eyebrow dark">
              <Sparkles size={13} />
              MADE FOR THE MOMENTS THAT MATTER
            </span>

            <h2>
              More than events.
              <span> Memories in the making.</span>
            </h2>
          </div>

          <p>
            From unforgettable live performances to
            inspiring new experiences, there's always
            something waiting to be discovered.
          </p>
        </section>

        {/* DISCOVERY */}
        <section className="cinema-discovery" id="discover">
          <div className="cinema-section-heading">
            <div>
              <span className="section-label">EXPLORE THE EXTRAORDINARY</span>
              <h2>Discover Events</h2>
              <p>Find your next reason to get excited.</p>
            </div>

            <span className="event-count">
              {events.length} events
            </span>
          </div>

          <div className="cinema-categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="cinema-state">
              <div className="cinema-spinner" />
              <p>Discovering experiences...</p>
            </div>
          ) : error ? (
            <div className="cinema-state">
              <p>{error}</p>
              <button onClick={fetchEvents}>Try again</button>
            </div>
          ) : events.length === 0 ? (
            <div className="cinema-empty">
              <div className="cinema-empty-icon">
                <CalendarDays size={32} />
              </div>
              <h3>Something exciting is on its way.</h3>
              <p>
                No approved events match your search right now.
                Check back soon for new experiences.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All Events");
                }}
              >
                Explore all events
              </button>
            </div>
          ) : (
            <div className="cinema-event-grid">
              {events.map((event) => (
                <article
                  className="cinema-event-card"
                  key={event._id}
                >
                  <div className="cinema-event-image">
                    {event.poster ? (
                      <img
  src={
    event.poster?.startsWith("http")
      ? event.poster
      : `http://localhost:5000${event.poster}`
  }
  alt={event.title}
/>
                    ) : (
                      <div className="cinema-poster-placeholder">
                        <Music2 size={40} />
                      </div>
                    )}

                    <span>{event.category}</span>
                  </div>

                  <div className="cinema-event-info">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>

                    <div className="cinema-event-detail">
                      <span>
                        <CalendarDays size={15} />
                        {formatDate(event.startDate)}
                      </span>

                      <span>
                        <MapPin size={15} />
                        {event.location}
                      </span>
                    </div>

                    <div className="cinema-event-bottom">
                      <div>
                        <small>Starting from</small>
                        <strong>
                          {Number(event.ticketPrice) === 0
                            ? "Free"
                            : `₹${event.ticketPrice}`}
                        </strong>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/events/${event._id}`)
                        }
                      >
                        Explore <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="cinema-footer">
        <div className="cinema-logo">
          <CalendarDays size={22} />
          <span>EventEase</span>
        </div>

        <p>Discover. Experience. Remember.</p>

        <span>© 2026 EventEase</span>
      </footer>

    </div>
  );
}
