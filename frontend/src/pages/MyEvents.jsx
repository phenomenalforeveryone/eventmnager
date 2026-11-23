
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, CalendarDays, MapPin, Pencil,
  Trash2, RefreshCw, Eye, Ticket
} from "lucide-react";
import api from "../services/api";
import "./MyEvents.css";

export default function MyEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events/my-events");
      const data = response.data;

      setEvents(
        Array.isArray(data) ? data :
        data.events || data.data?.events || []
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.location?.toLowerCase().includes(search.toLowerCase()) ||
        event.venue?.toLowerCase().includes(search.toLowerCase());

      const eventStatus = event.approvalStatus || "pending";

      const matchesStatus =
        status === "All" ||
        eventStatus.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [events, search, status]);

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/events/${event._id}`);
      setEvents((previous) =>
        previous.filter((item) => item._id !== event._id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete this event.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not set";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getStatus = (event) => {
    const value = event.approvalStatus || "pending";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="my-events-page">
      <header className="my-events-header">
        <div>
          <span className="my-events-eyebrow">EVENT MANAGEMENT</span>
          <h1>My Events</h1>
          <p>Manage, track and grow your experiences.</p>
        </div>

        <div className="my-events-header-actions">
          <button className="me-refresh-btn" onClick={fetchEvents}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            className="me-create-btn"
            onClick={() => navigate("/organizer/events/new")}
          >
            <Plus size={17} /> Create Event
          </button>
        </div>
      </header>

      <main className="my-events-content">
        <section className="me-summary">
          <div>
            <span>Total Events</span>
            <strong>{events.length}</strong>
          </div>
          <div>
            <span>Approved</span>
            <strong>
              {events.filter(e => e.approvalStatus === "approved").length}
            </strong>
          </div>
          <div>
            <span>Pending Review</span>
            <strong>
              {events.filter(e => e.approvalStatus === "pending").length}
            </strong>
          </div>
          <div>
            <span>Rejected</span>
            <strong>
              {events.filter(e => e.approvalStatus === "rejected").length}
            </strong>
          </div>
        </section>

        <section className="me-toolbar">
          <div className="me-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events by title, venue or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by approval status"
          >
            <option value="All">All statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </section>

        {loading ? (
          <div className="me-message">Loading your events...</div>
        ) : error ? (
          <div className="me-message me-error">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="me-empty">
            <CalendarDays size={42} />
            <h2>No events found</h2>
            <p>
              {events.length === 0
                ? "You haven't created any events yet."
                : "Try changing your search or filter."}
            </p>
            {events.length === 0 && (
              <button
                className="me-create-btn"
                onClick={() => navigate("/organizer/events/new")}
              >
                <Plus size={17} /> Create your first event
              </button>
            )}
          </div>
        ) : (
          <section className="me-event-list">
            {filteredEvents.map((event) => (
              <article className="me-event-card" key={event._id}>
                <div className="me-event-poster">
                  {event.poster ? (
                    <img
                      src={
                        event.poster.startsWith("http")
                          ? event.poster
                          : `http://localhost:5000${event.poster}`
                      }
                      alt={event.title}
                    />
                  ) : (
                    <CalendarDays size={30} />
                  )}
                </div>

                <div className="me-event-info">
                  <span className="me-category">
                    {event.category || "EVENT"}
                  </span>
                  <h3>{event.title}</h3>

                  <div className="me-event-meta">
                    <span>
                      <CalendarDays size={14} />
                      {formatDate(event.startDate)}
                    </span>
                    <span>
                      <MapPin size={14} />
                      {event.location || event.venue}
                    </span>
                    <span>
                      <Ticket size={14} />
                      ₹{event.ticketPrice ?? 0}
                    </span>
                  </div>
                </div>

                <div className="me-event-actions">
                  <span
                    className={`me-status ${getStatus(event).toLowerCase()}`}
                  >
                    {getStatus(event)}
                  </span>

                  <button
                    title="Edit event"
                    onClick={() =>
                      navigate(`/organizer/events/${event._id}/edit`)
                    }
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    title="View event"
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    className="me-delete-btn"
                    title="Delete event"
                    onClick={() => handleDelete(event)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
