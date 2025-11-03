const mongoose = require("mongoose");
const banner = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    image: { type: String, trim: true },
    link: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("banners", banner);
