
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Users,
  Heart,
  Share2,
  ShieldCheck,
  Minus,
  Plus,
  CheckCircle,
  UserRound,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./EventDetails.css";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/events/${id}`);
        setEvent(response.data.event);

        const savedItems = JSON.parse(
          localStorage.getItem("eventease_saved_events") || "[]"
        );

        setSaved(savedItems.includes(id));
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load this event."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const price = Number(event?.ticketPrice || 0);
  const availableSeats = Number(event?.availableSeats || 0);
  const total = price * quantity;

  const formatDate = (date) => {
    if (!date) return "Date to be announced";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const startDate = formatDate(event?.startDate);
  const startTime = formatTime(event?.startDate);
  const endTime = formatTime(event?.endDate);

  const image = event?.poster
    ? event.poster.startsWith("http")
      ? event.poster
      : `http://localhost:5000${event.poster}`
    : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400";

  const organizerName =
    event?.organizer?.name || "EventEase Organizer";

  const handleQuantity = (value) => {
    setQuantity((current) =>
      Math.min(10, availableSeats, Math.max(1, current + value))
    );
  };

  const handleSave = () => {
    try {
      const savedItems = JSON.parse(
        localStorage.getItem("eventease_saved_events") || "[]"
      );

      const updatedItems = saved
        ? savedItems.filter((item) => item !== id)
        : [...new Set([...savedItems, id])];

      localStorage.setItem(
        "eventease_saved_events",
        JSON.stringify(updatedItems)
      );

      setSaved(!saved);
      setMessage(
        saved
          ? "Event removed from your saved list."
          : "Event added to your saved list."
      );
    } catch {
      setMessage("Unable to update your saved events.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Event link copied to clipboard.");
    } catch {
      setMessage("Unable to copy the event link.");
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      setMessage("Only attendee accounts can book event tickets.");
      return;
    }

    if (availableSeats < quantity) {
      setMessage("Not enough seats are available. Please refresh the page.");
      return;
    }

    try {
      setBooking(true);
      setMessage("");

      const response = await api.post("/bookings", {
        eventId: id,
        quantity
      });

      setMessage(
        response.data.message || "Your booking was successful!"
      );

      navigate("/user/tickets", {
        state: {
          bookingSuccess: true,
          booking: response.data.booking
        }
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Booking failed. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="event-details-container">
          <h2>Loading event details...</h2>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="event-details-container">
          <h2>Event unavailable</h2>
          <p>{error || "This event could not be found."}</p>
          <button
            className="event-back-button"
            onClick={() => navigate("/events")}
          >
            <ArrowLeft size={17} />
            Back to events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <header className="event-details-nav">
        <div
          className="event-details-brand"
          onClick={() => navigate("/events")}
        >
          <span className="event-details-brand-icon">E</span>
          <span>EventEase</span>
        </div>

        <button
          className="event-back-button"
          onClick={() => navigate("/events")}
        >
          <ArrowLeft size={17} />
          Back to events
        </button>
      </header>

      <main className="event-details-container">
        <div className="event-breadcrumb">
          <span onClick={() => navigate("/events")}>Explore Events</span>
          <ArrowRight size={13} />
          <span>{event.category}</span>
          <ArrowRight size={13} />
          <strong>Event Details</strong>
        </div>

        <section className="event-details-hero">
          <img
            src={image}
            alt={event.title}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400";
            }}
          />

          <div className="event-details-hero-overlay" />

          <div className="event-details-hero-content">
            <span className="event-category-badge">
              {event.category}
            </span>

            <h1>{event.title}</h1>

            <div className="event-hero-meta">
              <span>
                <CalendarDays size={16} />
                {startDate}
              </span>
              <span>
                <MapPin size={16} />
                {event.location || event.venue}
              </span>
            </div>
          </div>
        </section>

        {message && (
          <div className="event-details-message">
            <CheckCircle size={17} />
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <div className="event-details-layout">
          <section className="event-details-information">
            <div className="event-info-heading">
              <div>
                <span className="event-section-eyebrow">
                  THE EXPERIENCE
                </span>
                <h2>About this event</h2>
              </div>

              <div className="event-detail-actions">
                <button
                  className={
                    saved
                      ? "event-action-button saved"
                      : "event-action-button"
                  }
                  onClick={handleSave}
                  title="Save event"
                >
                  <Heart
                    size={18}
                    fill={saved ? "currentColor" : "none"}
                  />
                </button>

                <button
                  className="event-action-button"
                  onClick={handleShare}
                  title="Share event"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <p className="event-description">
              {event.description ||
                "More information about this event will be available soon."}
            </p>

            <div className="event-facts-grid">
              <div className="event-fact">
                <div className="event-fact-icon">
                  <CalendarDays size={21} />
                </div>
                <div>
                  <span>DATE</span>
                  <strong>{startDate}</strong>
                </div>
              </div>

              <div className="event-fact">
                <div className="event-fact-icon">
                  <Clock size={21} />
                </div>
                <div>
                  <span>TIME</span>
                  <strong>
                    {startTime}
                    {endTime ? ` – ${endTime}` : ""}
                  </strong>
                </div>
              </div>

              <div className="event-fact">
                <div className="event-fact-icon">
                  <MapPin size={21} />
                </div>
                <div>
                  <span>VENUE</span>
                  <strong>
                    {event.venue || event.location || "To be announced"}
                  </strong>
                </div>
              </div>

              <div className="event-fact">
                <div className="event-fact-icon">
                  <Users size={21} />
                </div>
                <div>
                  <span>AVAILABLE SEATS</span>
                  <strong>{availableSeats} seats</strong>
                </div>
              </div>
            </div>

            {event.tags?.length > 0 && (
              <div className="event-tags-section">
                <h3>Event Highlights</h3>
                <div className="event-tags">
                  {event.tags.map((tag, index) => (
                    <span key={`${tag}-${index}`}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="event-organizer-card">
              <div className="event-organizer-avatar">
                <UserRound size={25} />
              </div>

              <div>
                <span>ORGANIZED BY</span>
                <h3>{organizerName}</h3>
                <p>Event organizer</p>
              </div>

              <ShieldCheck
                size={22}
                className="event-organizer-verified"
              />
            </div>
          </section>

          <aside className="event-booking-card">
            <div className="event-booking-heading">
              <span className="event-section-eyebrow">
                RESERVE YOUR SPOT
              </span>
              <h2>Book your tickets</h2>
              <p>Be part of an unforgettable experience.</p>
            </div>

            <div className="event-ticket-price">
              <div>
                <span>Ticket price</span>
                <strong>₹{price.toLocaleString("en-IN")}</strong>
              </div>
              <span className="event-ticket-unit">/ person</span>
            </div>

            <div className="event-quantity-section">
              <div>
                <strong>Number of tickets</strong>
                <span>Select your quantity (maximum 10)</span>
              </div>

              <div className="event-quantity-control">
                <button
                  onClick={() => handleQuantity(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease ticket quantity"
                >
                  <Minus size={15} />
                </button>

                <strong>{quantity}</strong>

                <button
                  onClick={() => handleQuantity(1)}
                  disabled={quantity >= Math.min(10, availableSeats)}
                  aria-label="Increase ticket quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div className="event-booking-total">
              <span>Total amount</span>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <button
              className="event-book-now"
              onClick={handleBooking}
              disabled={booking || availableSeats <= 0}
            >
              <Ticket size={18} />
              {booking
                ? "Processing..."
                : availableSeats > 0
                  ? "Book Now"
                  : "Sold Out"}
              {availableSeats > 0 && !booking && (
                <ArrowRight size={17} />
              )}
            </button>

            <div className="event-booking-security">
              <ShieldCheck size={16} />
              Secure booking experience
            </div>

            <div className="event-booking-note">
              <p>
                <CheckCircle size={14} />
                Instant booking confirmation
              </p>
              <p>
                <CheckCircle size={14} />
                Digital ticket access
              </p>
              <p>
                <CheckCircle size={14} />
                QR-based event entry
              </p>
            </div>
          </aside>
        </div>

        <section className="event-bottom-cta">
          <div>
            <span>DON'T MISS OUT</span>
            <h2>Make this experience yours.</h2>
            <p>
              Discover more events and create unforgettable memories.
            </p>
          </div>

          <button onClick={() => navigate("/events")}>
            Explore more events <ArrowRight size={17} />
          </button>
        </section>

        <footer className="event-details-footer">
          <span>EVENTEASE © 2026</span>
          <span>Every moment deserves an experience.</span>
        </footer>
      </main>
    </div>
  );
}
