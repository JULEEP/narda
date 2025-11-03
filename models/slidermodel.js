const mongoose = require("mongoose");
const sliderSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    sliders: { type: Array },
    createdBy: { type: String, trim: true },
    size: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    reporter: { type: String },
    category: { type: String },
    language: { type: String },
    isPaid: { type: String },
    isDownload: { type: String },
    visible: { type: String },
    status: {type: String , enum: ["active", "inactive"], default: "active"},
    tags: { type: Array },
    expirydate: { type: String },
    sliderId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("slider", sliderSchema);
