
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const crypto = require("crypto");
const generateQR = require("../utils/generateQR");

// Book tickets
exports.createBooking = async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body;
    const seats = Number(quantity);

    if (!eventId || !Number.isInteger(seats) || seats < 1 || seats > 10) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid event ID and quantity (1-10)."
      });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        approvalStatus: "approved",
        status: "upcoming",
        startDate: { $gt: new Date() },
        availableSeats: { $gte: seats }
      },
      { $inc: { availableSeats: -seats } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: "Event unavailable or not enough tickets."
      });
    }

    try {
      const ticketCode = crypto.randomUUID();
      const qrCode = await generateQR(ticketCode);

      const booking = await Booking.create({
        event: eventId,
        attendee: req.user._id,
        quantity: seats,
        totalAmount: updatedEvent.ticketPrice * seats,
        bookingStatus: "confirmed",
        paymentStatus: "pending",
        ticketCode,
        qrCode
      });

      try {
        await Notification.create({
          recipient: req.user._id,
          title: "Booking confirmed",
          message: `You booked ${seats} ticket(s) for ${updatedEvent.title}.`,
          type: "booking"
        });
      } catch (notificationError) {
        console.error("Booking notification failed:", notificationError.message);
      }

      return res.status(201).json({
        success: true,
        message: "Tickets booked successfully.",
        booking
      });
    } catch (error) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { availableSeats: seats }
      });
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking failed.",
      error: error.message
    });
  }
};

// Get logged-in user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      attendee: req.user._id
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch bookings.",
      error: error.message
    });
  }
};

// Get bookings for events owned by the logged-in organizer
exports.getOrganizerBookings = async (req, res) => {
  try {
    const { eventId } = req.query;

    const eventFilter = {
      organizer: req.user._id
    };

    if (eventId) {
      eventFilter._id = eventId;
    }

    const events = await Event.find(eventFilter).select("_id");
    const eventIds = events.map((event) => event._id);

    const bookings = await Booking.find({
      event: { $in: eventIds }
    })
      .populate("attendee", "name email")
      .populate("event", "title startDate venue location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch attendee bookings.",
      error: error.message
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      attendee: req.user._id,
      bookingStatus: "confirmed"
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Active booking not found."
      });
    }

    const event = await Event.findById(booking.event);

    if (!event || event.startDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Tickets cannot be cancelled after the event has started."
      });
    }

    booking.bookingStatus = "cancelled";

    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }

    await booking.save();

    await Event.findByIdAndUpdate(event._id, {
      $inc: { availableSeats: booking.quantity }
    });

    try {
      await Notification.create({
        recipient: req.user._id,
        title: "Booking cancelled",
        message: `Your booking for ${event.title} has been cancelled.`,
        type: "booking"
      });
    } catch (notificationError) {
      console.error("Cancellation notification failed:", notificationError.message);
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cancellation failed.",
      error: error.message
    });
  }
};

// Verify a ticket
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode) {
      return res.status(400).json({
        success: false,
        message: "Ticket code is required."
      });
    }

    const booking = await Booking.findOne({
      ticketCode,
      bookingStatus: "confirmed"
    }).populate("event", "title organizer startDate");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Invalid or cancelled ticket."
      });
    }

    if (
      booking.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot verify tickets for this event."
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket is valid.",
      ticket: {
        attendee: booking.attendee,
        event: booking.event.title,
        quantity: booking.quantity,
        ticketCode: booking.ticketCode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ticket verification failed.",
      error: error.message
    });
  }
};
