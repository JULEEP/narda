const mongoose = require("mongoose");
const staff = new mongoose.Schema({
  name: {
    type: String,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  departmentName: {
    type: String,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  roleName: {
    type: String,
  },
  phone: {
    type: String,
  },
  // employeName: {
  //   type: String,
  // },
  // Account  Information
  profilepic: {
    type: String,
  },
  password: {
    type: String,
  },
  email:{
    type:String
  },
  address: {
    type: String,
  },
  // image: {
  //   type: String,
  //   default: "",
  // },
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

module.exports = mongoose.model("staffs", staff);
