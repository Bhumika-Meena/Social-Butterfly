const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectMongo, getMongoUri } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Missing JWT secret. Set JWT_SECRET (or AUTH_JWT_SECRET).");
  }

  const mongoUri = getMongoUri();
  if (!mongoUri) {
    throw new Error("Missing Mongo URI. Set MONGO_URI (or MONGODB_URI).");
  }

  // Normalize aliases so downstream code always sees canonical names.
  process.env.JWT_SECRET = jwtSecret;
  process.env.MONGO_URI = mongoUri;

  await connectMongo();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

