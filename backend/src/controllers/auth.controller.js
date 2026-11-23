
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organizerStatus: user.organizerStatus,
  isActive: user.isActive
});

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user"
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: formatUser(user)
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated."
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: formatUser(user)
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message
    });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: formatUser(req.user)
  });
};

// LOGOUT
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful. Please clear the token on the client."
  });
};

// APPLY TO BECOME AN ORGANIZER
exports.applyOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.role === "admin" || user.role === "organizer") {
      return res.status(400).json({
        success: false,
        message: "Your account already has elevated access."
      });
    }

    if (user.organizerStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Your organizer application is already pending."
      });
    }

    user.organizerStatus = "pending";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Organizer application submitted successfully.",
      organizerStatus: user.organizerStatus,
      user: formatUser(user)
    });

  } catch (error) {
    console.error("Organizer application error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not submit organizer application."
    });
  }
};
