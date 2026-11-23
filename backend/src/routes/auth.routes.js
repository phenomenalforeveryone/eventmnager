
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout,
  applyOrganizer
} = require("../controllers/auth.controller");

const {
  protect
} = require("../middlewares/auth.middleware");

const {
  registerValidation,
  loginValidation,
  validateRequest
} = require("../validators/auth.validator");

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/apply-organizer", protect, applyOrganizer);

module.exports = router;
