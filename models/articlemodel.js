const mongoose = require("mongoose");
const articleSchema = new mongoose.Schema(
  {
    title: {
    type: String, 
    trim: true 
    },
    image: {
      type: Array 
    },
    description: {
      type: String,
    },
    shortdescription: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true 
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true 
    },
    likes: 
    { 
      type: Number, 
      default: 0 
    },
    comments: 
    { 
      type: Number,
      default: 0 
    },
    views:
    { 
      type: Number, 
      default: 0 
    },
    reporterId: {
       type: mongoose.Schema.Types.ObjectId,
    },
    reporter: {
       type: String,
    },
    category: {
    type: Array 
    },
    categoryId: {
    type: Array 
    },
    locationId: {
    type: Array 
    },
    subcategory: 
    { 
      type: mongoose.Schema.Types.ObjectId, 
    },
    language: 
    { 
      type: mongoose.Schema.Types.ObjectId,
    },
    isPaid: 
    { 
      type: String 
    },
    isDownload: 
    { 
      type: String 
    },
    visible:
     { 
      type: String
     },
    status: 
    { 
      type: String,
      default: "active" 
    },
    tags: 
    { 
      type: [String]
    },
    expirydate: 
    { 
      type: Date 
    },
    articleId: 
    { 
      type: String 
    },
    bookmark: 
    { 
      type: Boolean,
      default: false 
    },
    timetoread: 
    { 
      type: String 
    },
    topnews: 
    { 
      type: Boolean, 
      default: false 
    },
    ispublished: 
    { 
      type: Boolean, 
      default: true 
    },
    isPremium: 
    { 
      type: Boolean, 
      default: true 
    },
    draft: 
    { 
      type: Boolean 
    },
    banner: 
    { 
      type: String 
    },
    allcontent: 
    { 
      type: String 
    },
    stateId: 
    {
      type: Array,
    },
    location: 
    { 
      type: Array 
    },
    categoryName: {
      type: String,
    },
    locationName: {
      type: String,
    },
     middleImage: {
      type: String, // Single middle image
    },
      allowCopy: {
      type: String,
      enum: ["both", "subscribed", "unsubscribed", "none"],
      default: "both",
    },
    createdAt: {
      type : "string"
    },
    updatedAt: {
      type : "string"
    }
  }
  
);

module.exports = mongoose.model("article", articleSchema);
