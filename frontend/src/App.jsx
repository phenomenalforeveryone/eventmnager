
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEvent from "./pages/CreateEvent";
import MyEvents from "./pages/MyEvents";
import EditEvent from "./pages/EditEvent";
import OrganizerAttendees from "./pages/OrganizerAttendees";
import OrganizerAnalytics from "./pages/OrganizerAnalytics";
import UserDashboard from "./pages/UserDashboard";
import MyBookings from "./pages/MyBookings";
import MyTickets from "./pages/MyTickets";
import SavedEvents from "./pages/SavedEvents";
import UserProfile from "./pages/UserProfile";
import EventDetails from "./pages/EventDetails";
import Notifications from "./pages/Notifications";

// Redirect users according to their account status.
function getHomePath(user) {
  if (!user) return "/login";

  if (user.role === "admin") return "/admin";

  if (user.role === "organizer") return "/organizer";

  if (
    user.role === "user" &&
    ["pending", "rejected"].includes(user.organizerStatus)
  ) {
    return "/organizer/application-status";
  }

  return "/dashboard";
}

// Protect routes according to role and application status.
function ProtectedRoute({
  children,
  allowedRoles,
  redirectPending = false
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading EventEase...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Pending/rejected applicants cannot access private attendee pages.
  if (
    redirectPending &&
    user.role === "user" &&
    ["pending", "rejected"].includes(user.organizerStatus)
  ) {
    return (
      <Navigate to="/organizer/application-status" replace />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return children;
}

// Organizer application status page.
function OrganizerApplicationStatus() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const status = user?.organizerStatus;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleRefresh = async () => {
    try {
      const updatedUser = await refreshUser();

      if (updatedUser.role === "organizer") {
        navigate("/organizer", { replace: true });
      } else if (
        updatedUser.organizerStatus === "rejected"
      ) {
        // Remain on the application status page.
      }
    } catch (error) {
      console.error("Could not refresh application status:", error);
    }
  };

  return (
    <main className="auth-page">
      <section
        className="auth-card organizer-success-card"
        style={{ maxWidth: "550px", textAlign: "center" }}
      >
        <div
          className="organizer-success-icon"
          style={{ margin: "0 auto 20px" }}
        >
          {status === "rejected" ? "!" : "⏳"}
        </div>

        <p className="auth-eyebrow">EVENTEASE ORGANIZER PROGRAM</p>

        <h1>
          {status === "rejected"
            ? "Application Not Approved"
            : "Application Under Review"}
        </h1>

        <p className="organizer-success-description">
          Hello, {user?.name || "Organizer"}!
        </p>

        {status === "pending" && (
          <>
            <div className="organizer-pending-status">
              <div>
                <strong>Approval pending</strong>
                <p>
                  Your organizer application has been submitted
                  successfully. Our administrator will review your
                  details.
                </p>
              </div>
            </div>

            <p className="auth-terms">
              You cannot create or manage events until your
              application is approved.
            </p>
          </>
        )}

        {status === "rejected" && (
          <p className="organizer-success-description">
            Unfortunately, your organizer application was not
            approved. Please contact the EventEase administration
            team for further information.
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "24px"
          }}
        >
          <button
            type="button"
            className="auth-submit"
            onClick={handleRefresh}
          >
            Check application status
          </button>

          {status === "pending" && (
            <button
              type="button"
              className="auth-submit"
              onClick={() => navigate("/events")}
            >
              Browse Events
            </button>
          )}

          <button
            type="button"
            className="auth-submit"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading EventEase...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={getHomePath(user)} replace />}
      />

      <Route
        path="/login"
        element={
          user ? <Navigate to={getHomePath(user)} replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          user ? <Navigate to={getHomePath(user)} replace /> : <Register />
        }
      />

      {/* Organizer application status */}
      <Route
        path="/organizer/application-status"
        element={
          <ProtectedRoute
            allowedRoles={["user"]}
            redirectPending={false}
          >
            {user && ["pending", "rejected"].includes(user.organizerStatus)
              ? <OrganizerApplicationStatus />
              : <Navigate to={getHomePath(user)} replace />}
          </ProtectedRoute>
        }
      />

      {/* Events */}
      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={["user", "organizer"]}>
            <Events />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id"
        element={
          <ProtectedRoute
            allowedRoles={["user"]}
            redirectPending
          >
            <EventDetails />
          </ProtectedRoute>
        }
      />

      {/* Organizer routes */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/events/new"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <CreateEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/events"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <MyEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/events/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <EditEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/attendees"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerAttendees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/analytics"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Attendee routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["user"]}
            redirectPending
          >
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/bookings"
        element={
          <ProtectedRoute allowedRoles={["user"]} redirectPending>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/tickets"
        element={
          <ProtectedRoute allowedRoles={["user"]} redirectPending>
            <MyTickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/saved"
        element={
          <ProtectedRoute allowedRoles={["user"]} redirectPending>
            <SavedEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/profile"
        element={
          <ProtectedRoute allowedRoles={["user"]} redirectPending>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/notifications"
        element={
          <ProtectedRoute allowedRoles={["user"]} redirectPending>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
