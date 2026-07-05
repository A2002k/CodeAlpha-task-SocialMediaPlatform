const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://code-alpha-task-social-media-platfo.vercel.app",
];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("typing", ({ conversationId, receiverId, senderName }) => {
    socket.to(receiverId).emit("typing", { conversationId, senderName });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    socket.to(receiverId).emit("stopTyping");
  });

  socket.on("disconnect", () => {});
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Social Media API Running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err.message));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const notificationRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationRoutes);

const messageRoutes = require("./routes/messages");
app.use("/api/messages", messageRoutes);

const storyRoutes = require("./routes/stories");
app.use("/api/stories", storyRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});