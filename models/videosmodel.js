const mongoose = require('mongoose')
const { create } = require('./newsmodel')
const videoSchema = new mongoose.Schema({
  title: {
    type: String, trim: true
  },
  video:
  {
    type: String,
    trim: true
  },
  description:
  {
    type: String
  },
  createdBy:
  {
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
  reporter:
  {
    type: String
  },
  reporterId:
  {
    type: mongoose.Schema.Types.ObjectId,
  },
  category:
  { type: Array },

  categoryId:
  { type: Array },

  locationId:
  { type: Array },

  language:
  { type: String 

  },
  isPaid:
  { 
    type: String 
  },
  status:
  { 
    type: String 
  },
  tags:
  { type: Array },
  videoId:
    { type: String },
  postedAt:
  { type: Date },
  isPremium:
  { type: Boolean, default: true },
  youtube:
  { type: Boolean, default: true },
  banner:
  { type: String },
  timetoread:
  { type: String },
  location:
    { type: Array },
  createdAt:{
    type : "string",
  },
  updatedAt:{
    type : "string",
  }

})

module.exports = mongoose.model("videos", videoSchema)