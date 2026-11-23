
const express = require("express");
const router = express.Router();

const {
  getUsers,
  getPendingOrganizers,
  reviewOrganizer
} = require("../controllers/admin.controller");

const { protect, authorize } =
  require("../middlewares/auth.middleware");

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.get("/organizer-applications", getPendingOrganizers);
router.patch("/organizers/:id/review", reviewOrganizer);

module.exports = router;
