
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Notification = require("../models/Notification");

// Get all events awaiting admin approval
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ approvalStatus: "pending" })
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error("Get pending events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending events."
    });
  }
};

// Approve or reject an event
exports.reviewEvent = async (req, res) => {
  try {
    const { action, reason } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID."
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be approve or reject."
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    if (event.approvalStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This event has already been reviewed."
      });
    }

    event.approvalStatus =
      action === "approve" ? "approved" : "rejected";

    await event.save();

    // Notify the organizer
    try {
      await Notification.create({
        recipient: event.organizer,
        title: action === "approve"
          ? "Event approved"
          : "Event rejected",
        message: action === "approve"
          ? `Your event "${event.title}" has been approved.`
          : `Your event "${event.title}" was rejected. ${reason || ""}`,
        type: "event"
      });
    } catch (notificationError) {
      console.error("Notification creation failed:", notificationError);
    }

    return res.status(200).json({
      success: true,
      message: `Event ${action === "approve" ? "approved" : "rejected"} successfully.`,
      event
    });

  } catch (error) {
    console.error("Review event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review event."
    });
  }
};
