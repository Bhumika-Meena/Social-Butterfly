const path = require("path");
const multer = require("multer");
const express = require("express");

const { optionalAuth, requireAuth } = require("../middleware/auth");
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  getComments,
} = require("../controllers/postController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || ".jpg";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get("/", optionalAuth, getFeed);
router.post("/", requireAuth, upload.single("image"), createPost);

router.post("/:id/like", requireAuth, toggleLike);
router.post("/:id/comments", requireAuth, addComment);
router.get("/:id/comments", getComments);

module.exports = router;

