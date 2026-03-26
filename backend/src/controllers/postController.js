const mongoose = require("mongoose");

const Post = require("../models/Post");

function toInt(value, fallback) {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  return fallback;
}

function formatPostForFeed(postDoc, likedByMe) {
  return {
    id: postDoc._id.toString(),
    authorUsername: postDoc.authorUsername,
    text: postDoc.text,
    imageUrl: postDoc.imageUrl,
    likeCount: postDoc.likeCount,
    commentCount: postDoc.commentCount,
    likedByMe,
  };
}

async function createPost(req, res) {
  const { text } = req.body || {};
  const trimmedText = typeof text === "string" ? text.trim() : "";

  const file = req.file;
  const hasText = trimmedText.length > 0;
  const hasImage = Boolean(file);

  if (!hasText && !hasImage) {
    return res.status(400).json({ error: "Provide either text or an image (or both)." });
  }

  const uploadBaseUrl = process.env.UPLOAD_BASE_URL || "http://localhost:5000";

  try {
    const post = await Post.create({
      authorId: req.user.id,
      authorUsername: req.user.username,
      text: hasText ? trimmedText : "",
      imageUrl: hasImage ? `${uploadBaseUrl}/uploads/${file.filename}` : "",
      likes: [],
      comments: [],
    });

    return res.status(201).json({
      id: post._id.toString(),
      authorUsername: post.authorUsername,
      text: post.text,
      imageUrl: post.imageUrl,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to create post" });
  }
}

async function getFeed(req, res) {
  const limit = Math.min(20, toInt(req.query.limit, 10));
  const skip = toInt(req.query.skip, 0);

  // Optional auth (set by middleware); if missing, likedByMe will be false.
  const username = req.user?.username;

  const matchLiked = username
    ? {
        $in: [username, "$likes"],
      }
    : false;

  const pipeline = [
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        authorUsername: 1,
        text: 1,
        imageUrl: 1,
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
        likedByMe: username ? matchLiked : { $literal: false },
      },
    },
  ];

  const posts = await Post.aggregate(pipeline);
  return res.json({ posts: posts.map((p) => formatPostForFeed(p, p.likedByMe)) });
}

async function toggleLike(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  const username = req.user.username;

  const post = await Post.findById(id).select("likes");
  if (!post) return res.status(404).json({ error: "Post not found" });

  const alreadyLiked = post.likes.includes(username);
  if (alreadyLiked) {
    await Post.findByIdAndUpdate(id, { $pull: { likes: username } });
  } else {
    await Post.findByIdAndUpdate(id, { $addToSet: { likes: username } });
  }

  const updated = await Post.findById(id).select("likes");
  return res.json({
    likeCount: updated.likes.length,
    likedByMe: !alreadyLiked,
  });
}

async function addComment(req, res) {
  const { id } = req.params;
  const { text } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid post id" });
  }
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Comment text is required" });
  }

  const commentText = text.trim();

  const post = await Post.findById(id).select("comments");
  if (!post) return res.status(404).json({ error: "Post not found" });

  post.comments.push({ username: req.user.username, text: commentText });
  await post.save();

  return res.status(201).json({
    commentCount: post.comments.length,
    // Return just the last comment for optimistic UIs
    comment: post.comments[post.comments.length - 1],
  });
}

async function getComments(req, res) {
  const { id } = req.params;
  const limit = Math.min(50, toInt(req.query.limit, 20));

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  const post = await Post.findById(id).select("comments").lean();
  if (!post) return res.status(404).json({ error: "Post not found" });

  const all = post.comments || [];
  const slice = all.slice(Math.max(0, all.length - limit)).reverse(); // newest first

  return res.json({ commentCount: all.length, comments: slice });
}

module.exports = { createPost, getFeed, toggleLike, addComment, getComments };

