const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const User = require("../models/user");
const Notification = require("../models/notification");
const authMiddleware = require("../middleware/authMiddleware");

// Follow / Unfollow
router.put("/:id/follow", authMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyFollowing = currentUser.following.includes(req.params.id);

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );

      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user.id);

      await Notification.create({
        receiver: targetUser._id,
        sender: currentUser._id,
        type: "follow",
        text: `${currentUser.name} started following you`,
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: alreadyFollowing ? "User unfollowed" : "User followed",
      followingStatus: !alreadyFollowing,
      following: currentUser.following.length,
      followers: targetUser.followers.length,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get my profile
router.get("/me/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "name profileImage")
      .populate("following", "name profileImage");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update my profile with image upload
router.put(
  "/me/profile",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const name = req.body?.name;
      const bio = req.body?.bio;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.name = name || user.name;
      user.bio = bio || user.bio;

      if (req.file) {
        user.profileImage = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${req.file.filename}`;
      }

      await user.save();

      res.json({
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        followers: user.followers,
        following: user.following,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Search users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const keyword = req.query.search || "";

    const users = await User.find({
      _id: { $ne: req.user.id },
      name: { $regex: keyword, $options: "i" },
    }).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name profileImage")
      .populate("following", "name profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;