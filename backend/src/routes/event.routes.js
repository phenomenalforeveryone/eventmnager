
const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents
} = require("../controllers/event.controller");

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes
router.get("/", getEvents);

// Organizer routes
router.get("/my-events", protect, getMyEvents);

router.post(
  "/",
  protect,
  upload.single("poster"),
  createEvent
);

// Update event, including an optional poster upload
router.put(
  "/:id",
  protect,
  upload.single("poster"),
  updateEvent
);

router.delete("/:id", protect, deleteEvent);

// Keep this route last
router.get("/:id", getEventById);

module.exports = router;
