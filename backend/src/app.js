const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: false }));
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));

  // Serve uploaded images
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);

  // Generic error handler
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    const _ = next;
    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ error: message });
  });

  return app;
}

module.exports = createApp();

