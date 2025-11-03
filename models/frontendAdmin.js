const mongoose = require("mongoose");
const admin = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  profilePic: {
    type: String,
    default: "uploads/public/userlogo.png",
  },
  address: {
    type: String,
  },
  rolesAndPermission: {
    type: Array,
  },
  notificationsBell: {
    type: Boolean,
    enum: [false, true],
    default: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  logCreatedDate: {
    type: String,
  },
  logModifiedDate: {
    type: String,
  },
});
module.exports = mongoose.model("frontendAdmins", admin);
