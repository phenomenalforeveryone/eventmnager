
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const eventRoutes = require("./routes/event.routes");
const adminEventRoutes = require("./routes/adminEvent.routes");
const bookingRoutes = require("./routes/booking.routes");
const notificationRoutes = require("./routes/notification.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Serve uploaded event posters and other uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// API rate limiting
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventEase API is running!",
    status: "healthy"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Event routes
app.use("/api/events", eventRoutes);

// Admin event routes
app.use("/api/admin/events", adminEventRoutes);

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// User routes
app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

module.exports = app;
