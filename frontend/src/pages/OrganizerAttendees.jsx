
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Users,
  Ticket,
  IndianRupee,
  CalendarDays,
  Download,
  Eye,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import api from "../services/api";
import "./OrganizerAttendees.css";

export default function OrganizerAttendees() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsResponse, bookingsResponse] = await Promise.all([
        api.get("/events/my-events"),
        api.get("/bookings/organizer")
      ]);

      setEvents(eventsResponse.data.events || []);
      setBookings(bookingsResponse.data.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load attendee records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedEventName =
    selectedEvent === "all"
      ? "All Events"
      : events.find((event) => event._id === selectedEvent)?.title || "";

  const eventBookings = useMemo(() => {
    if (selectedEvent === "all") return bookings;

    return bookings.filter(
      (booking) => booking.event?._id === selectedEvent
    );
  }, [bookings, selectedEvent]);

  const filteredAttendees = useMemo(() => {
    return eventBookings.filter((booking) => {
      const name = booking.attendee?.name || "";
      const email = booking.attendee?.email || "";
      const bookingId = booking._id || "";
      const status = booking.bookingStatus || "";

      const query = search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        bookingId.toLowerCase().includes(query) ||
        (booking.ticketCode || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [eventBookings, search, statusFilter]);

  const confirmed = eventBookings.filter(
    (booking) => booking.bookingStatus === "confirmed"
  );

  const totalTickets = confirmed.reduce(
    (sum, booking) => sum + Number(booking.quantity || 0),
    0
  );

  const totalRevenue = confirmed.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0
  );

  const pendingBookings = eventBookings.filter(
    (booking) => booking.paymentStatus === "pending"
  ).length;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleExport = () => {
    const headers = [
      "Booking ID",
      "Attendee Name",
      "Email",
      "Event",
      "Tickets",
      "Amount",
      "Booking Date",
      "Booking Status",
      "Payment Status"
    ];

    const rows = filteredAttendees.map((booking) => [
      booking._id,
      booking.attendee?.name || "Unknown",
      booking.attendee?.email || "",
      booking.event?.title || "",
      booking.quantity,
      booking.totalAmount,
      formatDate(booking.createdAt),
      booking.bookingStatus,
      booking.paymentStatus
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
    link.download = "eventease-attendees.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="attendees-page">
      <header className="attendees-header">
        <button
          className="attendees-back"
          onClick={() => navigate("/organizer")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <span>EVENTEASE / ORGANIZER STUDIO</span>
      </header>

      <main className="attendees-container">
        <section className="attendees-title-section">
          <div>
            <span className="attendees-eyebrow">EVENT MANAGEMENT</span>
            <h1>Attendee Management</h1>
            <p>
              Know your audience, manage registrations and track bookings.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="attendees-export" onClick={fetchData}>
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="attendees-export"
              onClick={handleExport}
              disabled={filteredAttendees.length === 0}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </section>

        <section className="attendees-event-selector">
          <div>
            <span>SELECT EVENT</span>
            <h3>{selectedEventName}</h3>
          </div>

          <div className="attendees-select-wrap">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="all">All Events</option>

              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />
          </div>
        </section>

        {error && (
          <div className="attendees-preview-notice">
            {error}
          </div>
        )}

        <section className="attendees-stats">
          <article className="attendee-stat-card">
            <div className="attendee-stat-icon">
              <Users size={20} />
            </div>
            <span>Total Registrations</span>
            <strong>{eventBookings.length}</strong>
            <small>Actual booking records</small>
          </article>

          <article className="attendee-stat-card">
            <div className="attendee-stat-icon">
              <Ticket size={20} />
            </div>
            <span>Confirmed Tickets</span>
            <strong>{totalTickets}</strong>
            <small>From confirmed bookings</small>
          </article>

          <article className="attendee-stat-card">
            <div className="attendee-stat-icon">
              <IndianRupee size={20} />
            </div>
            <span>Booking Value</span>
            <strong>₹{totalRevenue.toLocaleString("en-IN")}</strong>
            <small>Confirmed booking amounts</small>
          </article>

          <article className="attendee-stat-card">
            <div className="attendee-stat-icon">
              <CalendarDays size={20} />
            </div>
            <span>Pending Payments</span>
            <strong>{pendingBookings}</strong>
            <small>Payment status pending</small>
          </article>
        </section>

        <section className="attendees-table-section">
          <div className="attendees-table-heading">
            <div>
              <h2>Registered Attendees</h2>
              <p>View actual event booking records.</p>
            </div>

            <span className="attendees-count">
              {filteredAttendees.length} records
            </span>
          </div>

          <div className="attendees-toolbar">
            <div className="attendees-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search name, email or booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="attendees-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="attendees-preview-notice">
              Loading attendee records...
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="attendees-preview-notice">
              No attendee bookings found for this event.
            </div>
          ) : (
            <div className="attendees-table-wrapper">
              <table className="attendees-table">
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Event</th>
                    <th>Tickets</th>
                    <th>Amount</th>
                    <th>Booking Date</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendees.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <strong>
                          {booking.attendee?.name || "Unknown"}
                        </strong>
                        <br />
                        <small>
                          {booking.attendee?.email || "No email"}
                        </small>
                      </td>

                      <td>{booking.event?.title || "Event unavailable"}</td>
                      <td>{booking.quantity}</td>
                      <td>
                        ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td>{formatDate(booking.createdAt)}</td>

                      <td>
                        <span>
                          {booking.bookingStatus}
                          {" / "}
                          {booking.paymentStatus}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedAttendee(booking)}
                          aria-label="View booking details"
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedAttendee && (
        <div
          className="attendees-modal-overlay"
          onClick={() => setSelectedAttendee(null)}
        >
          <div
            className="attendees-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="attendees-modal-close"
              onClick={() => setSelectedAttendee(null)}
            >
              ×
            </button>

            <h2>Booking Details</h2>

            <p>
              <strong>Attendee:</strong>{" "}
              {selectedAttendee.attendee?.name || "Unknown"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedAttendee.attendee?.email || "—"}
            </p>

            <p>
              <strong>Event:</strong>{" "}
              {selectedAttendee.event?.title || "—"}
            </p>

            <p>
              <strong>Booking ID:</strong> {selectedAttendee._id}
            </p>

            <p>
              <strong>Ticket Code:</strong>{" "}
              {selectedAttendee.ticketCode || "—"}
            </p>

            <p>
              <strong>Tickets:</strong> {selectedAttendee.quantity}
            </p>

            <p>
              <strong>Amount:</strong> ₹
              {Number(selectedAttendee.totalAmount || 0).toLocaleString("en-IN")}
            </p>

            <p>
              <strong>Booking Status:</strong>{" "}
              {selectedAttendee.bookingStatus}
            </p>

            <p>
              <strong>Payment Status:</strong>{" "}
              {selectedAttendee.paymentStatus}
            </p>

            <p>
              <strong>Booking Date:</strong>{" "}
              {formatDate(selectedAttendee.createdAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
