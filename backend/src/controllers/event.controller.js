
const Event = require("../models/Event");
const User = require("../models/User");

// Parse tags sent as JSON or comma-separated text
const parseTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(tags);

    if (Array.isArray(parsed)) {
      return parsed.map((tag) => String(tag).trim()).filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated tags
  }

  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (
      !user ||
      user.role !== "organizer" ||
      user.organizerStatus !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only approved organizers can create events."
      });
    }

    const {
      title,
      description,
      category,
      tags,
      venue,
      location,
      startDate,
      endDate,
      ticketPrice,
      capacity
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category ||
      !venue?.trim() ||
      !location?.trim() ||
      !startDate ||
      !endDate ||
      ticketPrice === undefined ||
      capacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required event details."
      });
    }

    if (
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate)) ||
      new Date(endDate) <= new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid event dates."
      });
    }

    if (
      !Number.isFinite(Number(ticketPrice)) ||
      !Number.isInteger(Number(capacity)) ||
      Number(ticketPrice) < 0 ||
      Number(capacity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket price or capacity."
      });
    }

    const parsedTags = parseTags(tags);

    const posterPath = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      tags: parsedTags,
      poster: posterPath,
      organizer: user._id,
      venue: venue.trim(),
      location: location.trim(),
      startDate,
      endDate,
      ticketPrice: Number(ticketPrice),
      capacity: Number(capacity),
      availableSeats: Number(capacity),
      approvalStatus: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Event submitted for admin approval.",
      event
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event.",
      error: error.message
    });
  }
};

// Get all approved events with search, filters and pagination
exports.getEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      sort = "date",
      page = 1,
      limit = 9
    } = req.query;

    const filter = {
      approvalStatus: "approved",
      status: { $ne: "cancelled" }
    };

    if (category) filter.category = category;

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sortOptions = {
      date: { startDate: 1 },
      newest: { createdAt: -1 },
      priceLow: { ticketPrice: 1 },
      priceHigh: { ticketPrice: -1 }
    };

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(50, Math.max(1, Number(limit) || 9));

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("organizer", "name")
        .sort(sortOptions[sort] || sortOptions.date)
        .skip((currentPage - 1) * pageLimit)
        .limit(pageLimit),
      Event.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageLimit),
      events
    });
  } catch (error) {
    console.error("Get events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
      error: error.message
    });
  }
};

// Get one approved event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      approvalStatus: "approved"
    }).populate("organizer", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    return res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
      error: error.message
    });
  }
};

// Update an event owned by the organizer
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or access denied."
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "venue",
      "location",
      "startDate",
      "endDate",
      "ticketPrice",
      "capacity"
    ];

    const updates = req.body || {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        event[field] =
          typeof updates[field] === "string"
            ? updates[field].trim()
            : updates[field];
      }
    });

    if (updates.tags !== undefined) {
      event.tags = parseTags(updates.tags);
    }

    // Replace poster only when a new file is uploaded
    if (req.file) {
      event.poster = `/uploads/${req.file.filename}`;
    }

    if (
      !event.title ||
      !event.description ||
      !event.category ||
      !event.venue ||
      !event.location
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required event details."
      });
    }

    if (
      isNaN(new Date(event.startDate).getTime()) ||
      isNaN(new Date(event.endDate).getTime()) ||
      new Date(event.endDate) <= new Date(event.startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid event dates."
      });
    }

    const bookedSeats = event.capacity - event.availableSeats;

    if (
      !Number.isFinite(Number(event.ticketPrice)) ||
      Number(event.ticketPrice) < 0 ||
      !Number.isInteger(Number(event.capacity)) ||
      Number(event.capacity) < 1 ||
      Number(event.capacity) < bookedSeats
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid price or capacity cannot be below booked seats."
      });
    }

    event.ticketPrice = Number(event.ticketPrice);
    event.capacity = Number(event.capacity);
    event.availableSeats = event.capacity - bookedSeats;

    // Updated events require admin approval again
    event.approvalStatus = "pending";

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated and sent for approval.",
      event
    });
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update event.",
      error: error.message
    });
  }
};

// Delete an event owned by the organizer
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or access denied."
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete event.",
      error: error.message
    });
  }
};

// Get events created by the logged-in organizer
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your events.",
      error: error.message
    });
  }
};
