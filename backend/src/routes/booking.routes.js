
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getOrganizerBookings,
  cancelBooking,
  verifyTicket
} = require("../controllers/booking.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");

router.use(protect);

// Attendee booking routes
router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/:id/cancel", cancelBooking);

// Organizer attendee-management route
router.get(
  "/organizer",
  authorize("organizer"),
  getOrganizerBookings
);

// Ticket verification
router.post("/verify", verifyTicket);

module.exports = router;
