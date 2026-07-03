const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    image: {
      type: String,
      required: true,
    },

    isRepost: {
  type: Boolean,
  default: false,
},

originalPost: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Post",
  default: null,
},

    taggedUsers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],



    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);