const mongoose = require("mongoose");

const notification = new mongoose.Schema({
  date: {
    type: String,
    trim: true,
  },
  time: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
  },
  image: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
  },
  sendTo: {
    type: String,
    trim: true,
    enum: ["Admin", "User", "All"],
  },
  users: {
    type: Array,
  },

  logCreatedDate: {
    type: String,
    trim: true,
  },
  logModifiedDate: {
    type: String,
    trim: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("notifications", notification);
