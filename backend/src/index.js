const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectMongo } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables.");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in environment variables.");
  }

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

