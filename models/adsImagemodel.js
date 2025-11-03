const mongoose = require("mongoose");

const adsImageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      default: "banner", // optional default
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    expirydate: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("adsimages", adsImageSchema);
