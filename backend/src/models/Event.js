
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    description: {
      type: String,
      required: true,
      maxlength: 3000
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Technology",
        "Music",
        "Sports",
        "Cultural",
        "Workshop",
        "Education",
        "Business",
        "Other"
      ]
    },

    tags: [String],

    poster: {
      type: String,
      default: ""
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    venue: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming"
    }
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", description: "text", tags: "text" });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ organizer: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);
