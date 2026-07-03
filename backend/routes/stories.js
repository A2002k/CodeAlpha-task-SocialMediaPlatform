const express = require("express");
const router = express.Router();

const Story = require("../models/story");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Create story
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const story = await Story.create({
      user: req.user.id,
      image: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    });

    const populatedStory = await Story.findById(story._id).populate(
      "user",
      "name profileImage"
    );

    res.status(201).json(populatedStory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get active stories
router.get("/", auth, async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "name profileImage")
      .populate("viewers", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View story
router.put("/:id/view", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (!story.viewers.includes(req.user.id)) {
      story.viewers.push(req.user.id);
      await story.save();
    }

    const updatedStory = await Story.findById(story._id)
  .populate("user", "name profileImage")
  .populate("viewers", "name profileImage");

    res.json(updatedStory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like / unlike story
router.put("/:id/like", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const alreadyLiked = story.likes.includes(req.user.id);

    if (alreadyLiked) {
      story.likes = story.likes.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      story.likes.push(req.user.id);
    }

    await story.save();
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;