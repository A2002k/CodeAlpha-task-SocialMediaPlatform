const express = require("express");
const router = express.Router();

const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const Notification = require("../models/notification");

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Create Post
router.post("/", auth, upload.single("image"), async (req, res) => {

  try {
    const { caption, taggedUsers } = req.body;
    const parsedTaggedUsers = taggedUsers ? JSON.parse(taggedUsers) : [];

    const post = await Post.create({
      user: req.user.id,
      caption,
      image:
        req.file &&
        `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
        taggedUsers: parsedTaggedUsers,
    });

    for (const taggedUserId of parsedTaggedUsers) {
  if (taggedUserId.toString() !== req.user.id) {
    const sender = await User.findById(req.user.id);

    await Notification.create({
      receiver: taggedUserId,
      sender: req.user.id,
      type: "tag",
      post: post._id,
      text: `${sender.name} tagged you in a post`,
    });
  }
}

    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "name profileImage"
    );

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
  
});

// Get Feed
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like / Unlike Post
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user.id
      );
    } else {
      post.likes.push(req.user.id);

      if (post.user.toString() !== req.user.id) {
        const sender = await User.findById(req.user.id);

        await Notification.create({
          receiver: post.user,
          sender: req.user.id,
          type: "like",
          post: post._id,
          text: `${sender.name} liked your post`,
        });
      }
    }

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "user",
      "name profileImage"
    );

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user.id,
      text,
    });

    if (post.user.toString() !== req.user.id) {
      const sender = await User.findById(req.user.id);

      await Notification.create({
        receiver: post.user,
        sender: req.user.id,
        type: "comment",
        post: post._id,
        text: `${sender.name} commented on your post`,
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name profileImage"
    );

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Repost
router.post("/:id/repost", auth, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id).populate(
      "user",
      "name profileImage"
    );

    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    const repost = await Post.create({
      user: req.user.id,
      caption: originalPost.caption,
      image: originalPost.image,
      isRepost: true,
      originalPost: originalPost._id,
    });

    if (originalPost.user._id.toString() !== req.user.id) {
      const sender = await User.findById(req.user.id);

      await Notification.create({
        receiver: originalPost.user._id,
        sender: req.user.id,
        type: "repost",
        post: originalPost._id,
        text: `${sender.name} reposted your post`,
      });
    }

    const populatedRepost = await Post.findById(repost._id)
      .populate("user", "name profileImage")
      .populate({
        path: "originalPost",
        populate: {
          path: "user",
          select: "name profileImage",
        },
      });

    res.status(201).json(populatedRepost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Comments
router.get("/:id/comments", auth, async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.id,
    })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Single Post
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name profileImage")
      .populate("taggedUsers", "name profileImage")
      .populate({
        path: "originalPost",
        populate: {
          path: "user",
          select: "name profileImage",
        },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit Post Caption
router.put("/:id", auth, async (req, res) => {
  try {
    const { caption } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.caption = caption || post.caption;

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "user",
      "name profileImage"
    );

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

  
});

module.exports = router;