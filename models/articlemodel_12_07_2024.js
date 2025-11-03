const mongoose = require("mongoose");
const articleSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    data: { type: Array },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    createdBy: { type: String, trim: true },
    size: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    reporter: { type: String },
    category: { type: Array },

    subcategory: { type: String },
    language: { type: String },
    isPaid: { type: String },
    isDownload: { type: String },
    visible: { type: String },
    status: { type: String },
    tags: { type: Array },
    expirydate: { type: Date },
    articleId: { type: String },
    bookmark: { type: Boolean, default: false },
    timetoread: { type: String },
    topnews: { type: Boolean, default: false },
    ispublished: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: true },
    draft: { type: Boolean },
    banner: { type: String },
    allcontent: { type: String },
    stateId: {
      type: Array,
    },
    location: { type: Array },

    categoryName: {
      type: String,
    },
    locationName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("article", articleSchema);
