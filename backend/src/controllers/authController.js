const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { username: user.username },
    process.env.JWT_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

async function signup(req, res) {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email, and password are required" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }

  // Basic email check (MongoDB Atlas will enforce uniqueness on email)
  const emailStr = String(email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(emailStr)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const existing = await User.findOne({ email: emailStr }).lean();
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      username: String(username).trim(),
      email: emailStr,
      passwordHash,
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id.toString(), username: user.username, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to sign up" });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const emailStr = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: emailStr });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user);
  return res.status(200).json({
    token,
    user: { id: user._id.toString(), username: user.username, email: user.email },
  });
}

async function me(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await User.findById(req.user.id).select("username email");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ id: user._id.toString(), username: user.username, email: user.email });
}

module.exports = { signup, login, me };

