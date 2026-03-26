const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 30 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true, collection: "users" }
);

// Ensure unique email at the database level
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);

