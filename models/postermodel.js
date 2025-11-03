const mongoose = require("mongoose");
const posterSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    image: { type: [String], trim: true },
    description: { type: String },
    createdBy: { type: String, trim: true },
    size: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    reporter: { type: String },
    category: { type: Array },
    categoryId:{ type: Array },
    locationId:{ type: Array },
    subcategory: { type: String },
    language: { type: String },
    isPaid: { type: String },
    isDownload: { type: String },
    visible: { type: String },
    status: { type: String ,enum: ["active", "inactive"], default: "active"},
    tags: { type: Array },
    expirydate: { type: Date },
    posterId: { type: String },
    topnews: { type: Boolean, default: false },
    bookmark: { type: Boolean, default: false },
    location: { type: Array },
    type: { type: String, trim: true, default: "poster" }, // <-- Added field
    createdAt: { type:"string" },
    updatedAt: { type:"string" },
  },

);

posterSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.createdAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }
  next();
});

module.exports = mongoose.model("poster", posterSchema);
