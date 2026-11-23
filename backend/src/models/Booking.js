const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending"
    },
    ticketCode: {
      type: String,
      unique: true,
      sparse: true
    },
    qrCode: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

bookingSchema.index({ attendee: 1, createdAt: -1 });
bookingSchema.index({ event: 1, bookingStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);