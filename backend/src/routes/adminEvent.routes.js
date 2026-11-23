
const express = require("express");
const router = express.Router();

const {
  getPendingEvents,
  reviewEvent
} = require("../controllers/adminEvent.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");

// Only authenticated admins can manage event approvals
router.use(protect, authorize("admin"));

router.get("/pending", getPendingEvents);
router.patch("/:id/review", reviewEvent);

module.exports = router;
