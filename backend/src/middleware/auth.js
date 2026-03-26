const jwt = require("jsonwebtoken");

function getAuthHeader(req) {
  return req.headers.authorization || "";
}

function parseBearerToken(headerValue) {
  const parts = headerValue.split(" ");
  if (parts.length !== 2) return null;
  if (parts[0] !== "Bearer") return null;
  return parts[1];
}

function optionalAuth(req, res, next) {
  const token = parseBearerToken(getAuthHeader(req));
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch (err) {
    req.user = null; // Don't block public feeds
    return next();
  }
}

function requireAuth(req, res, next) {
  const token = parseBearerToken(getAuthHeader(req));
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAuth, optionalAuth };

