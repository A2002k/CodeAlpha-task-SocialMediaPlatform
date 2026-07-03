const express = require("express");
const router = express.Router();

const Notification = require("../models/notification");
const auth = require("../middleware/authMiddleware");

// Get my notifications
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user.id,
    })
      .populate("sender", "name profileImage")
      .populate("post", "image caption")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all notifications as read
router.put("/read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user.id },
      { isRead: true }
    );

    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark one notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.json(notification);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});



module.exports = router;