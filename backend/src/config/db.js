const mongoose = require("mongoose");

function getMongoUri() {
  return process.env.MONGO_URI || process.env.MONGODB_URI || "";
}

async function connectMongo() {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error("Missing Mongo URI. Set MONGO_URI (or MONGODB_URI).");
  }

  // Mongoose connections pool defaults are fine for this assignment
  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}

module.exports = { connectMongo, getMongoUri };

