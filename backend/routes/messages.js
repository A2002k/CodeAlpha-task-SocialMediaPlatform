const express = require("express");
const router = express.Router();

const Conversation = require("../models/conversation");
const Message = require("../models/message");
const auth = require("../middleware/authMiddleware");

// Create or get conversation
router.post("/conversation", auth, async (req, res) => {
  try {
    const { receiverId } = req.body;

    let conversation = await Conversation.findOne({
      members: { $all: [req.user.id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user.id, receiverId],
      });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my conversations
router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.user.id,
    })
      .populate("members", "name profileImage")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post("/", auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name profileImage"
    );

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { updatedAt: new Date() },
      { new: true }
    );

    const receiverId = conversation.members.find(
      (id) => id.toString() !== req.user.id
    );

    const io = req.app.get("io");

    io.to(receiverId.toString()).emit("receiveMessage", {
      conversationId,
      message: populatedMessage,
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread messages count
router.get("/unread/count", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.user.id,
    });

    const conversationIds = conversations.map((conv) => conv._id);

    const count = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user.id },
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark messages as read in a conversation
router.put("/:conversationId/read", auth, async (req, res) => {
  try {
    const updated = await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user.id },
        isRead: false,
      },
      {
        isRead: true,
        seenAt: new Date(),
      }
    );

    const conversation = await Conversation.findById(req.params.conversationId);

    const receiverId = conversation.members.find(
      (id) => id.toString() !== req.user.id
    );

    const io = req.app.get("io");

    io.to(receiverId.toString()).emit("messagesSeen", {
      conversationId: req.params.conversationId,
      seenAt: new Date(),
    });

    res.json({ message: "Messages marked as read", updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages for conversation
router.get("/:conversationId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name profileImage")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;