
const mongoose = require("mongoose");
const User = require("../models/User");
const Notification = require("../models/Notification");

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve users."
    });
  }
};

// GET PENDING ORGANIZER APPLICATIONS
exports.getPendingOrganizers = async (req, res) => {
  try {
    const applications = await User.find({
      organizerStatus: "pending"
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error("Get organizer applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve organizer applications."
    });
  }
};

// APPROVE OR REJECT ORGANIZER APPLICATION
exports.reviewOrganizer = async (req, res) => {
  try {
    const { action, reason = "" } = req.body;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be approve or reject."
      });
    }

    const user = await User.findOne({
      _id: id,
      organizerStatus: "pending",
      role: "user"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pending organizer application not found."
      });
    }

    // Update application status
    user.organizerStatus =
      action === "approve" ? "approved" : "rejected";

    // Only approved applicants receive organizer privileges
    if (action === "approve") {
      user.role = "organizer";
    }

    await user.save();

    // Notify the applicant
    try {
      await Notification.create({
        recipient: user._id,
        title: action === "approve"
          ? "Organizer application approved"
          : "Organizer application rejected",
        message: action === "approve"
          ? "Congratulations! Your organizer application has been approved. You can now create and manage events."
          : `Your organizer application was rejected. ${reason}`.trim(),
        type: "organizer",
        link: action === "approve" ? "/organizer" : "/dashboard"
      });
    } catch (notificationError) {
      console.error(
        "Organizer notification error:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      message: `Organizer application ${
        action === "approve" ? "approved" : "rejected"
      } successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizerStatus: user.organizerStatus,
        organizerType: user.organizerType,
        organizationName: user.organizationName,
        contactNumber: user.contactNumber,
        organizerExperience: user.organizerExperience,
        organizerWebsite: user.organizerWebsite
      }
    });
  } catch (error) {
    console.error("Review organizer error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not review organizer application."
    });
  }
};
