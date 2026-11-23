
import React, { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Compass,
  Ticket,
  Heart,
  UserRound,
  LogOut,
  Menu,
  X,
  Clock,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./MyTickets.css";

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

const formatTime = (start, end) => {
  if (!start) return "Time unavailable";

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };

  const startTime = new Date(start).toLocaleTimeString("en-IN", options);

  if (!end) return startTime;

  const endTime = new Date(end).toLocaleTimeString("en-IN", options);

  return `${startTime} – ${endTime}`;
};

const formatTicket = (booking) => {
  const event = booking.event || {};

  return {
    ...booking,
    id: booking.ticketCode || booking._id,
    bookingId: booking._id,
    title: event.title || "Event unavailable",
    category: event.category || "Event",
    date: formatDate(event.startDate),
    time: formatTime(event.startDate, event.endDate),
    venue: event.venue || "Venue unavailable",
    location: event.location || "",
    quantity: booking.quantity || 1,
    price: booking.totalAmount || 0,
    status: booking.bookingStatus,
    qrCode: booking.qrCode || ""
  };
};

function MyTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.name?.split(" ")[0] || "there";

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/bookings/my-bookings");

      const records = response.data.bookings || [];

      const confirmedTickets = records
        .filter((booking) => booking.bookingStatus === "confirmed")
        .map(formatTicket);

      setTickets(confirmedTickets);

      const requestedId = location.state?.bookingId;

      const selected =
        confirmedTickets.find(
          (ticket) =>
            ticket.bookingId === requestedId ||
            ticket.id === requestedId
        ) || confirmedTickets[0] || null;

      setSelectedTicket(selected);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!selectedTicket?.qrCode) return;

    const link = document.createElement("a");
    link.href = selectedTicket.qrCode;
    link.download = `EventEase-${selectedTicket.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mytickets-layout">
      <aside className={`mytickets-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="mytickets-brand">
          <div className="mytickets-brand-icon">E</div>
          <div>
            <h2>EventEase</h2>
            <span>YOUR EVENT WORLD</span>
          </div>
        </div>

        <div className="mytickets-sidebar-label">MENU</div>

        <nav className="mytickets-navigation">
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

          <button className="active">
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

        <div className="mytickets-sidebar-bottom">
          <div className="mytickets-promo">
            <ShieldCheck size={20} />
            <h4>Your ticket, your entry.</h4>
            <p>Keep your digital ticket ready when you arrive.</p>
          </div>

          <button className="mytickets-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="mytickets-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="mytickets-main">
        <header className="mytickets-topbar">
          <div className="mytickets-topbar-left">
            <button
              className="mytickets-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span>My Space</span>
            <span>/</span>
            <strong>My Tickets</strong>
          </div>

          <div className="mytickets-topbar-right">
            <span>EVENT ENTHUSIAST</span>
            <div className="mytickets-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="mytickets-content">
          <section className="mytickets-heading">
            <div>
              <span className="mytickets-eyebrow">YOUR DIGITAL PASSES</span>
              <h1>My Tickets</h1>
              <p>
                Everything you need for your next event, right here.
              </p>
            </div>

            <button
              className="mytickets-booking-link"
              onClick={() => navigate("/user/bookings")}
            >
              View Bookings <ArrowUpRight size={16} />
            </button>
          </section>

          {error && (
            <div className="mytickets-preview-notice">
              <ShieldCheck size={17} />
              <span>{error}</span>
              <button onClick={fetchTickets}>Retry</button>
            </div>
          )}

          <section className="mytickets-ticket-section">
            <div className="mytickets-section-heading">
              <div>
                <span>READY FOR YOUR NEXT EXPERIENCE</span>
                <h2>Your Digital Tickets</h2>
              </div>

              <span className="mytickets-count">
                {tickets.length} ticket(s)
              </span>
            </div>

            {loading ? (
              <div className="mytickets-preview-notice">
                <RefreshCw size={17} />
                <span>Loading your tickets...</span>
              </div>
            ) : tickets.length > 0 ? (
              <>
                <div className="mytickets-ticket-selector">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.bookingId}
                      className={`mytickets-selector-item ${
                        selectedTicket?.bookingId === ticket.bookingId
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="mytickets-selector-icon">
                        <Ticket size={19} />
                      </div>

                      <div>
                        <strong>{ticket.title}</strong>
                        <span>{ticket.date}</span>
                      </div>

                      <CheckCircle2 size={18} />
                    </button>
                  ))}
                </div>

                {selectedTicket && (
                  <div className="mytickets-ticket-wrapper">
                    <div className="mytickets-ticket">
                      <div className="mytickets-ticket-main">
                        <div className="mytickets-ticket-top">
                          <div className="mytickets-ticket-brand">
                            <div className="mytickets-ticket-logo">E</div>
                            <div>
                              <strong>EventEase</strong>
                              <span>ADMIT ONE</span>
                            </div>
                          </div>

                          <span className="mytickets-confirmed">
                            <CheckCircle2 size={14} />
                            CONFIRMED
                          </span>
                        </div>

                        <div className="mytickets-ticket-event">
                          <span>
                            {selectedTicket.category.toUpperCase()}
                          </span>
                          <h2>{selectedTicket.title}</h2>
                          <p>
                            Your entry pass to an experience worth remembering.
                          </p>
                        </div>

                        <div className="mytickets-ticket-details">
                          <div>
                            <span>DATE</span>
                            <strong>{selectedTicket.date}</strong>
                          </div>

                          <div>
                            <span>TIME</span>
                            <strong>{selectedTicket.time}</strong>
                          </div>

                          <div>
                            <span>VENUE</span>
                            <strong>{selectedTicket.venue}</strong>
                          </div>

                          <div>
                            <span>LOCATION</span>
                            <strong>{selectedTicket.location}</strong>
                          </div>

                          <div>
                            <span>TICKET TYPE</span>
                            <strong>General Admission</strong>
                          </div>

                          <div>
                            <span>QUANTITY</span>
                            <strong>{selectedTicket.quantity}</strong>
                          </div>
                        </div>

                        <div className="mytickets-ticket-bottom">
                          <div>
                            <span>ATTENDEE</span>
                            <strong>{user?.name || "Event Attendee"}</strong>
                          </div>

                          <div>
                            <span>BOOKING ID</span>
                            <strong>{selectedTicket.bookingId}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mytickets-ticket-stub">
                        <div className="mytickets-stub-heading">
                          <span>YOUR ENTRY PASS</span>
                          <QrCode size={19} />
                        </div>

                        <div className="mytickets-qr-placeholder">
                          {selectedTicket.qrCode ? (
                            <img
                              src={selectedTicket.qrCode}
                              alt="Booking QR code"
                              style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "contain"
                              }}
                            />
                          ) : (
                            <>
                              <QrCode size={105} strokeWidth={1.3} />
                              <span>QR CODE UNAVAILABLE</span>
                            </>
                          )}
                        </div>

                        <div className="mytickets-stub-id">
                          <span>TICKET ID</span>
                          <strong>{selectedTicket.id}</strong>
                        </div>

                        <div className="mytickets-stub-price">
                          <span>BOOKING AMOUNT</span>
                          <strong>₹{selectedTicket.price}</strong>
                        </div>

                        <div className="mytickets-stub-note">
                          <ShieldCheck size={15} />
                          Keep this ticket ready at entry.
                        </div>
                      </div>
                    </div>

                    <div className="mytickets-ticket-actions">
                      <button
                        className="mytickets-print-button"
                        onClick={handlePrint}
                      >
                        <Printer size={17} />
                        Print Ticket
                      </button>

                      <button
                        className="mytickets-download-button"
                        onClick={handleDownloadQR}
                        disabled={!selectedTicket.qrCode}
                      >
                        <Download size={17} />
                        Download QR
                      </button>

                      <button
                        className="mytickets-download-button"
                        onClick={handlePrint}
                      >
                        <Download size={17} />
                        Save as PDF
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mytickets-preview-notice">
                <Ticket size={20} />
                <span>
                  You don't have any confirmed tickets yet. Book an event to
                  receive your digital entry pass.
                </span>
                <button onClick={() => navigate("/events")}>
                  Explore Events
                </button>
              </div>
            )}
          </section>

          <section className="mytickets-reminder">
            <div className="mytickets-reminder-icon">
              <Clock size={21} />
            </div>
            <div>
              <h3>A little reminder before you go</h3>
              <p>
                Arrive early, keep your ticket accessible, and have your
                booking details ready at the entrance.
              </p>
            </div>
          </section>

          <footer className="mytickets-footer">
            <span>© 2026 EventEase. Made for experiences.</span>
            <span>Your next story starts here.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default MyTickets;
