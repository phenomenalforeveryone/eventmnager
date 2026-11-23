
import { useEffect, useMemo, useState } from "react";
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
  Search,
  MapPin,
  Clock,
  ChevronRight,
  ArrowUpRight,
  QrCode,
  Filter,
  Eye,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./MyBookings.css";

function formatDate(date) {
  if (!date) return "Date not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getBookingStatus(booking) {
  if (booking.bookingStatus === "cancelled") return "Cancelled";

  if (
    booking.event?.endDate &&
    new Date(booking.event.endDate) < new Date()
  ) {
    return "Completed";
  }

  return "Confirmed";
}

function MyBookings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const firstName = user?.name?.split(" ")[0] || "there";

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/my-bookings");
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formattedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const event = booking.event || {};
      const status = getBookingStatus(booking);

      return {
        ...booking,
        id: booking._id,
        title: event.title || "Event unavailable",
        category: event.category || "Other",
        date: formatDate(event.startDate),
        time: `${formatTime(event.startDate)}${
          event.endDate ? ` – ${formatTime(event.endDate)}` : ""
        }`,
        venue: event.venue || "Venue not available",
        location: event.location || "",
        bookedOn: formatDate(booking.createdAt),
        status,
        payment: booking.paymentStatus || "pending",
        amount: Number(booking.totalAmount || 0),
        quantity: Number(booking.quantity || 1)
      };
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return formattedBookings.filter((booking) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        booking.title.toLowerCase().includes(search) ||
        booking.id.toLowerCase().includes(search) ||
        booking.location.toLowerCase().includes(search) ||
        (booking.ticketCode || "").toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" || booking.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [formattedBookings, searchTerm, activeFilter]);

  const confirmedCount = formattedBookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  const cancelledCount = formattedBookings.filter(
    (booking) => booking.status === "Cancelled"
  ).length;

  const completedCount = formattedBookings.filter(
    (booking) => booking.status === "Completed"
  ).length;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCancelBooking = async (booking) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your booking for "${booking.title}"?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(booking.id);
      setActionMessage("");

      await api.patch(`/bookings/${booking.id}/cancel`);

      setBookings((current) =>
        current.map((item) =>
          item._id === booking.id
            ? { ...item, bookingStatus: "cancelled" }
            : item
        )
      );

      setSelectedBooking(null);
      setActionMessage("Your booking has been cancelled successfully.");
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Unable to cancel this booking."
      );
    } finally {
      setCancellingId("");
    }
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="mybookings-layout">
      <aside className={`mybookings-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="mybookings-brand">
          <div className="mybookings-brand-icon">E</div>
          <div>
            <h2>EventEase</h2>
            <span>YOUR EVENT WORLD</span>
          </div>
        </div>

        <div className="mybookings-sidebar-label">MENU</div>

        <nav className="mybookings-navigation">
          <button onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button onClick={() => navigate("/events")}>
            <Compass size={19} />
            Explore Events
          </button>

          <button className="active">
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

        <div className="mybookings-sidebar-bottom">
          <div className="mybookings-promo">
            <CalendarDays size={20} />
            <h4>More to experience</h4>
            <p>Discover events and make new memories.</p>
            <button onClick={() => navigate("/events")}>
              Explore events <ArrowUpRight size={14} />
            </button>
          </div>

          <button className="mybookings-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="mybookings-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="mybookings-main">
        <header className="mybookings-topbar">
          <div className="mybookings-topbar-left">
            <button
              className="mybookings-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <span>My Space</span>
            <ChevronRight size={15} />
            <strong>My Bookings</strong>
          </div>

          <div className="mybookings-topbar-right">
            <span>EVENT ENTHUSIAST</span>
            <div className="mybookings-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="mybookings-content">
          <section className="mybookings-heading">
            <div>
              <span className="mybookings-eyebrow">YOUR RESERVATIONS</span>
              <h1>My Bookings</h1>
              <p>
                All your event reservations, together in one place.
              </p>
            </div>

            <button
              className="mybookings-explore-button"
              onClick={() => navigate("/events")}
            >
              <Compass size={17} />
              Discover Events
            </button>
          </section>

          {actionMessage && (
            <div className="mybookings-preview-notice">
              <Filter size={17} />
              <span>{actionMessage}</span>
            </div>
          )}

          {error && (
            <div className="mybookings-preview-notice">
              <XCircle size={17} />
              <span>{error}</span>
              <button onClick={fetchBookings}>Retry</button>
            </div>
          )}

          <section className="mybookings-summary">
            <div className="mybookings-summary-card">
              <div className="mybookings-summary-icon total">
                <Ticket size={20} />
              </div>
              <div>
                <span>Total Bookings</span>
                <h2>{loading ? "—" : bookings.length}</h2>
              </div>
            </div>

            <div className="mybookings-summary-card">
              <div className="mybookings-summary-icon confirmed">
                <CalendarDays size={20} />
              </div>
              <div>
                <span>Confirmed</span>
                <h2>{loading ? "—" : confirmedCount}</h2>
              </div>
            </div>

            <div className="mybookings-summary-card">
              <div className="mybookings-summary-icon pending">
                <Clock size={20} />
              </div>
              <div>
                <span>Cancelled</span>
                <h2>{loading ? "—" : cancelledCount}</h2>
              </div>
            </div>

            <div className="mybookings-summary-card">
              <div className="mybookings-summary-icon completed">
                <XCircle size={20} />
              </div>
              <div>
                <span>Completed</span>
                <h2>{loading ? "—" : completedCount}</h2>
              </div>
            </div>
          </section>

          <section className="mybookings-list-section">
            <div className="mybookings-list-heading">
              <div>
                <h2>Booking History</h2>
                <p>Search and manage your event reservations.</p>
              </div>

              <span className="mybookings-record-count">
                {filteredBookings.length} records
              </span>
            </div>

            <div className="mybookings-toolbar">
              <div className="mybookings-search">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search by event, booking ID or location..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="mybookings-filters">
                {["All", "Confirmed", "Cancelled", "Completed"].map(
                  (filter) => (
                    <button
                      key={filter}
                      className={activeFilter === filter ? "active" : ""}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mybookings-records">
              {loading ? (
                <div className="mybookings-empty">
                  <RefreshCw size={27} />
                  <h3>Loading your bookings...</h3>
                </div>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <article className="mybookings-record" key={booking.id}>
                    <div className="mybookings-record-icon">
                      <CalendarDays size={22} />
                    </div>

                    <div className="mybookings-record-info">
                      <div className="mybookings-record-title">
                        <h3>{booking.title}</h3>
                        <span
                          className={`mybookings-status ${booking.status.toLowerCase()}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <span className="mybookings-record-category">
                        {booking.category}
                      </span>

                      <div className="mybookings-record-meta">
                        <span>
                          <CalendarDays size={14} />
                          {booking.date}
                        </span>
                        <span>
                          <Clock size={14} />
                          {booking.time}
                        </span>
                        <span>
                          <MapPin size={14} />
                          {booking.venue}, {booking.location}
                        </span>
                      </div>

                      <div className="mybookings-record-id">
                        Booking ID: {booking.id}
                      </div>
                    </div>

                    <div className="mybookings-record-payment">
                      <strong>{formatCurrency(booking.amount)}</strong>
                      <span>
                        Payment: {booking.payment}
                      </span>
                      <small>{booking.quantity} ticket(s)</small>
                    </div>

                    <div className="mybookings-record-actions">
                      <button
                        className="mybookings-details-button"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye size={15} />
                        Details
                      </button>

                      {booking.status === "Confirmed" && (
                        <button
                          className="mybookings-ticket-button"
                          onClick={() => navigate("/user/tickets")}
                        >
                          <QrCode size={15} />
                          Ticket
                        </button>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="mybookings-empty">
                  <div>
                    <Search size={27} />
                  </div>
                  <h3>No bookings found</h3>
                  <p>
                    {bookings.length === 0
                      ? "You have not booked any events yet."
                      : "Try another search term or select a different status."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </section>

          <footer className="mybookings-footer">
            <span>© 2026 EventEase. Made for experiences.</span>
            <span>Your next story starts here.</span>
          </footer>
        </div>
      </main>

      {selectedBooking && (
        <div
          className="mybookings-modal-backdrop"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="mybookings-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mybookings-modal-heading">
              <div>
                <span>RESERVATION DETAILS</span>
                <h2>Booking Information</h2>
              </div>

              <button onClick={() => setSelectedBooking(null)}>
                <X size={20} />
              </button>
            </div>

            <h3>{selectedBooking.title}</h3>

            <span className="mybookings-modal-category">
              {selectedBooking.category}
            </span>

            <div className="mybookings-modal-details">
              <div>
                <span>Booking ID</span>
                <strong>{selectedBooking.id}</strong>
              </div>

              <div>
                <span>Event Date</span>
                <strong>{selectedBooking.date}</strong>
              </div>

              <div>
                <span>Time</span>
                <strong>{selectedBooking.time}</strong>
              </div>

              <div>
                <span>Venue</span>
                <strong>{selectedBooking.venue}</strong>
              </div>

              <div>
                <span>Booked On</span>
                <strong>{selectedBooking.bookedOn}</strong>
              </div>

              <div>
                <span>Tickets</span>
                <strong>{selectedBooking.quantity}</strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong>{selectedBooking.payment}</strong>
              </div>

              <div>
                <span>Booking Status</span>
                <strong>{selectedBooking.status}</strong>
              </div>

              <div>
                <span>Ticket Code</span>
                <strong>{selectedBooking.ticketCode || "Not available"}</strong>
              </div>
            </div>

            <div className="mybookings-modal-total">
              <span>Total Amount</span>
              <strong>{formatCurrency(selectedBooking.amount)}</strong>
            </div>

            {selectedBooking.status === "Confirmed" && (
              <button
                className="mybookings-details-button"
                disabled={cancellingId === selectedBooking.id}
                onClick={() => handleCancelBooking(selectedBooking)}
                style={{ marginTop: "15px" }}
              >
                <XCircle size={16} />
                {cancellingId === selectedBooking.id
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            )}

            <button
              className="mybookings-modal-close"
              onClick={() => setSelectedBooking(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
