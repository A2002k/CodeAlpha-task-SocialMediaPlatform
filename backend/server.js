const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://vercel.com/a2002ks-projects/code-alpha-task-social-media-platform/Hm5B7Jfa6s9mozqJfewzuzvkgXa1",
    ],
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

const PORT = process.env.PORT || 5000;

//auth routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

//posts and users routes
const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);

//comments routes
const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

//notifications
const notificationRoutes = require("./routes/notifications");
app.use("/api/notifications", notificationRoutes);

//chat
const messageRoutes = require("./routes/messages");
app.use("/api/messages", messageRoutes);

//stories
const storyRoutes = require("./routes/stories");
app.use("/api/stories", storyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});