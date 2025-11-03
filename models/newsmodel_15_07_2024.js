const mongoose = require("mongoose");
const newsSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    data: { type: Array },
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
    newsId: { type: String },
    timetoread: { type: String },
    topnews: { type: Boolean, default: false },
    bookmark: { type: Boolean, default: false },
    postedAt: { type: Date },
    ispublished: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: true },
    draft: { type: Boolean },
    banner: { type: String },
    allcontent: { type: String },
    //
    // reporterId: {
    //   type: mongoose.Schema.Types.ObjectId,
    // },

    location: { type: Array },
    //
    // image: { type: Array },
    // stateId: {
    //   type: mongoose.Schema.Types.ObjectId,
    // },
    // stateName: {
    //   type: String,
    // },
    // districtId: {
    //   type: mongoose.Schema.Types.ObjectId,
    // },
    // districtName: {
    //   type: String,
    // },
    // reporterId: {
    //   type: mongoose.Schema.Types.ObjectId,
    // },
    // // category: [{ type: mongoose.Schema.Types.ObjectId }],
    // categoryName: {
    //   type: String,
    // },
    // location: [{ type: mongoose.Schema.Types.ObjectId }],
    // locationName: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("news", newsSchema);
