const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorUsername: { type: String, required: true, trim: true },

    text: { type: String, default: "" },
    imageUrl: { type: String, default: "" },

    // Store usernames to satisfy the requirement
    likes: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true, collection: "posts" }
);

PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);

