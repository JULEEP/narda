const mongoose = require("mongoose");
const reporterSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    type: { type: String, trim: true },
    profileimg: { type: String, trim: true },
    password: { type: String, trim: true, required: true },
    bio: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reporter", reporterSchema);
